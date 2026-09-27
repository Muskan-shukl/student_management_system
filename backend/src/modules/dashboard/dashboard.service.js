const { User } = require('../users/user.model');
const { Student, STUDENT_POPULATE } = require('../students/student.model');
const { ROLES, USER_STATUS, STUDENT_STATUS } = require('../../config/constants');
const announcements = require('../announcements/announcement.service');
const timetable = require('../timetable/timetable.service');
const { Assignment } = require('../assignments/assignment.model');
const { Attendance } = require('../attendance/attendance.model');
const attendance = require('../attendance/attendance.service');

const startOfToday = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');

const countBy = (docs, key) => docs.map((d) => ({ [key]: d._id, count: d.count }));

const adminStats = async (user) => {
  const [roleCounts, pendingTeachers, studentStatus, byCourse, recentStudents, latestAnnouncements, attendanceTrend, todayOverview, assignmentCount, teacherLoad] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.find({ role: ROLES.TEACHER, status: USER_STATUS.PENDING }).sort({ createdAt: -1 }).limit(5),
    Student.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
    Student.find().populate(STUDENT_POPULATE).sort({ createdAt: -1 }).limit(5),
    announcements.latest(user),
    attendance.trend(14),
    attendance.overview(),
    Assignment.countDocuments(),
    // Start from every active teacher (not just ones with students) so a newly added teacher still shows up.
    User.aggregate([
      { $match: { role: ROLES.TEACHER, status: USER_STATUS.ACTIVE } },
      { $lookup: { from: 'students', localField: '_id', foreignField: 'assignedTeacher', as: 'students' } },
      {
        $project: {
          _id: 1,
          name: 1,
          department: 1,
          students: { $size: '$students' },
          avgAttendance: {
            $let: {
              vars: { withAtt: { $filter: { input: '$students', as: 's', cond: { $gt: ['$$s.attendance.total', 0] } } } },
              in: {
                $cond: [
                  { $gt: [{ $size: '$$withAtt' }, 0] },
                  { $round: [{ $avg: { $map: { input: '$$withAtt', as: 's', in: { $multiply: [{ $divide: ['$$s.attendance.present', '$$s.attendance.total'] }, 100] } } } }, 0] },
                  null,
                ],
              },
            },
          },
        },
      },
      { $sort: { students: -1, name: 1 } },
    ]),
  ]);
  const todayByTeacher = new Map(todayOverview.teachers.map((t) => [String(t.teacher._id), t]));
  const teachers = teacherLoad.map((t) => {
    const today = todayByTeacher.get(String(t._id));
    const marked = today?.marked ?? 0;
    return {
      ...t,
      markedToday: marked > 0,
      todayAttendance: marked > 0 ? Math.round(((today.present + today.late) / marked) * 100) : null,
    };
  });

  const roles = Object.fromEntries(roleCounts.map((r) => [r._id, r.count]));
  const statuses = Object.fromEntries(studentStatus.map((s) => [s._id, s.count]));

  return {
    users: {
      total: roleCounts.reduce((n, r) => n + r.count, 0),
      admins: roles.admin || 0,
      teachers: roles.teacher || 0,
      students: roles.student || 0,
      pendingTeachers: await User.countDocuments({ role: ROLES.TEACHER, status: USER_STATUS.PENDING }),
    },
    students: {
      total: Object.values(statuses).reduce((n, c) => n + c, 0),
      active: statuses[STUDENT_STATUS.ACTIVE] || 0,
      unassigned: await Student.countDocuments({ assignedTeacher: { $exists: false } }),
      byCourse: countBy(byCourse, 'course'),
    },
    pendingTeachers,
    recentStudents,
    announcements: latestAnnouncements,
    attendanceTrend,
    today: todayOverview.totals,
    teachers,
    assignments: assignmentCount,
  };
};

const teacherStats = async (teacher) => {
  const students = await Student.find({ assignedTeacher: teacher._id }).populate(STUDENT_POPULATE).sort({ createdAt: -1 });

  const [todayClasses, latestAnnouncements, toCheck, markedToday] = await Promise.all([
    timetable.today({ teacher: teacher._id }),
    announcements.latest(teacher),
    Assignment.aggregate([{ $match: { teacher: teacher._id } }, { $unwind: '$submissions' }, { $match: { 'submissions.status': 'submitted' } }, { $count: 'n' }]),
    Attendance.exists({ date: startOfToday(), student: { $in: students.map((s) => s._id) } }),
  ]);

  const withAttendance = students.filter((s) => s.attendancePercent !== null);
  const withGrades = students.filter((s) => s.averageScore !== null);
  const avg = (arr, key) => (arr.length ? Math.round(arr.reduce((n, s) => n + s[key], 0) / arr.length) : null);

  return {
    assigned: students.length,
    averageAttendance: avg(withAttendance, 'attendancePercent'),
    averageScore: avg(withGrades, 'averageScore'),
    ungraded: students.filter((s) => !s.grades.length).length,
    lowAttendance: withAttendance.filter((s) => s.attendancePercent < 75).slice(0, 5),
    recentStudents: students.slice(0, 5),
    todayClasses,
    announcements: latestAnnouncements,
    submissionsToCheck: toCheck[0]?.n ?? 0,
    attendanceMarkedToday: Boolean(markedToday),
  };
};

const studentStats = async (user) => {
  const student = await Student.findOne({ user: user._id }).populate(STUDENT_POPULATE);
  const [todayClasses, latestAnnouncements, assignments] = await Promise.all([
    student ? timetable.today({ course: student.course, year: student.year }) : [],
    announcements.latest(user),
    student?.assignedTeacher
      ? Assignment.find({ teacher: student.assignedTeacher._id, $or: [{ course: { $in: [null, ''] } }, { course: student.course }] }).select('title subject dueDate submissions').sort({ dueDate: 1 })
      : [],
  ]);
  const pendingAssignments = assignments
    .filter((a) => !a.submissions.some((s) => String(s.student) === String(student?._id)))
    .map((a) => ({ _id: a._id, title: a.title, subject: a.subject, dueDate: a.dueDate, overdue: a.dueDate < startOfToday() }));
  return {
    profile: student,
    todayClasses,
    announcements: latestAnnouncements,
    pendingAssignments: pendingAssignments.slice(0, 5),
    pendingCount: pendingAssignments.length,
    averageScore: student?.averageScore ?? null,
    attendancePercent: student?.attendancePercent ?? null,
    gradedSubjects: student?.grades.length ?? 0,
    bestSubject: student?.grades.length
      ? [...student.grades].sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)[0]
      : null,
  };
};

const getForUser = (user) => {
  if (user.role === ROLES.ADMIN) return adminStats(user);
  if (user.role === ROLES.TEACHER) return teacherStats(user);
  return studentStats(user);
};

module.exports = { getForUser };
