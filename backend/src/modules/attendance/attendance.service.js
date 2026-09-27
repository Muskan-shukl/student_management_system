const { Types } = require('mongoose');
const { Attendance } = require('./attendance.model');
const { Student } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../config/constants');

const monthRange = (month) => {
  const [y, m] = (month ?? new Date().toISOString().slice(0, 7)).split('-').map(Number);
  return { from: new Date(Date.UTC(y, m - 1, 1)), to: new Date(Date.UTC(y, m, 1)) };
};

/** Keep the cached totals on the student in sync with the daily records. */
const recompute = async (ids) => {
  const studentIds = ids.map((id) => new Types.ObjectId(String(id)));
  const rows = await Attendance.aggregate([
    { $match: { student: { $in: studentIds } } },
    { $group: { _id: '$student', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
  ]);
  const byId = new Map(rows.map((r) => [String(r._id), r]));
  await Promise.all(
    studentIds.map((id) => {
      const r = byId.get(String(id)) ?? { present: 0, total: 0 };
      return Student.updateOne({ _id: id }, { attendance: { present: r.present, total: r.total } });
    })
  );
};

/** All assigned students with their status for one day (null = not marked). */
const sheet = async (teacher, date) => {
  const students = await Student.find({ assignedTeacher: teacher._id, status: 'active' }).populate({ path: 'user', select: 'name' }).sort({ rollNumber: 1 });
  const records = await Attendance.find({ date, student: { $in: students.map((s) => s._id) } });
  const status = new Map(records.map((r) => [String(r.student), r.status]));
  return {
    date,
    marked: records.length > 0,
    students: students.map((s) => ({ _id: s._id, name: s.user.name, rollNumber: s.rollNumber, course: s.course, status: status.get(String(s._id)) ?? null })),
  };
};

const mark = async (teacher, { date, entries }) => {
  const ids = entries.map((e) => e.student);
  const allowed = await Student.countDocuments({ _id: { $in: ids }, assignedTeacher: teacher._id });
  if (allowed !== new Set(ids.map(String)).size) throw ApiError.forbidden('You can only mark attendance for your own students');

  await Attendance.bulkWrite(
    entries.map((e) => ({
      updateOne: { filter: { student: e.student, date }, update: { $set: { status: e.status, markedBy: teacher._id } }, upsert: true },
    }))
  );
  await recompute(ids);
  return sheet(teacher, date);
};

const historyFor = async (studentId, month) => {
  const { from, to } = monthRange(month);
  const [records, summary] = await Promise.all([
    Attendance.find({ student: studentId, date: { $gte: from, $lt: to } }).sort({ date: 1 }).select('date status'),
    Attendance.aggregate([{ $match: { student: studentId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(summary.map((s) => [s._id, s.count]));
  const total = Object.values(counts).reduce((n, c) => n + c, 0);
  const present = (counts.present ?? 0) + (counts.late ?? 0);
  return {
    month: from.toISOString().slice(0, 7),
    records,
    summary: { present: counts.present ?? 0, late: counts.late ?? 0, absent: counts.absent ?? 0, total, percent: total ? Math.round((present / total) * 100) : null },
  };
};

const history = async (studentId, month, actor) => {
  const scope = actor.role === ROLES.TEACHER ? { assignedTeacher: actor._id } : {};
  const student = await Student.findOne({ _id: studentId, ...scope }).select('_id');
  if (!student) throw ApiError.notFound('Student not found');
  return historyFor(student._id, month);
};

const me = async (user, month) => {
  const student = await Student.findOne({ user: user._id }).select('_id');
  if (!student) throw ApiError.notFound('Student profile not found');
  return historyFor(student._id, month);
};

/** Campus-wide picture for one day: per-teacher register status + overall low attendance. */
const overview = async (date = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')) => {
  const [students, records] = await Promise.all([
    Student.find({ status: 'active' }).populate([{ path: 'user', select: 'name' }, { path: 'assignedTeacher', select: 'name' }]),
    Attendance.find({ date }).select('student status'),
  ]);
  const byStudent = new Map(records.map((r) => [String(r.student), r.status]));

  const teachers = new Map();
  let unassigned = 0;
  for (const s of students) {
    if (!s.assignedTeacher) { unassigned += 1; continue; }
    const key = String(s.assignedTeacher._id);
    const t = teachers.get(key) ?? { teacher: { _id: s.assignedTeacher._id, name: s.assignedTeacher.name }, students: 0, marked: 0, present: 0, late: 0, absent: 0, roster: [] };
    t.students += 1;
    const st = byStudent.get(String(s._id));
    if (st) { t.marked += 1; t[st] += 1; }
    t.roster.push({ _id: s._id, name: s.user.name, rollNumber: s.rollNumber, status: st ?? null });
    teachers.set(key, t);
  }

  const evaluated = students.filter((s) => s.attendancePercent !== null).length;
  const totals = { students: students.length, marked: records.length, present: 0, late: 0, absent: 0, unassigned, evaluated };
  for (const r of records) totals[r.status] += 1;

  const lowAttendance = students
    .filter((s) => s.attendancePercent !== null && s.attendancePercent < 75)
    .sort((a, b) => a.attendancePercent - b.attendancePercent)
    .slice(0, 10)
    .map((s) => ({ _id: s._id, name: s.user.name, rollNumber: s.rollNumber, course: s.course, teacher: s.assignedTeacher?.name ?? null, percent: s.attendancePercent, attendance: s.attendance }));

  return { date, totals, teachers: [...teachers.values()].sort((a, b) => a.teacher.name.localeCompare(b.teacher.name)), lowAttendance };
};

/** Daily campus attendance % for the last N days (for the dashboard trend). */
const trend = async (days = 14) => {
  const from = new Date(Date.now() - (days - 1) * 86400000);
  from.setUTCHours(0, 0, 0, 0);
  const rows = await Attendance.aggregate([
    { $match: { date: { $gte: from } } },
    { $group: { _id: '$date', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ date: r._id, total: r.total, percent: Math.round((r.present / r.total) * 100) }));
};

module.exports = { sheet, mark, history, me, overview, trend };
