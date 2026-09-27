const mongoose = require('mongoose');
const { Student, generateRollNumber, STUDENT_POPULATE } = require('./student.model');
const { User } = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { searchRegex, escapeRegex } = require('../../utils/regex');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { ROLES, USER_STATUS } = require('../../config/constants');

const USER_FIELDS = ['name', 'email', 'password', 'phone'];

const splitPayload = (payload) => {
  const user = {};
  const student = {};
  for (const [key, value] of Object.entries(payload)) {
    (USER_FIELDS.includes(key) ? user : student)[key] = value;
  }
  return { user, student };
};

const assertTeacher = async (teacherId) => {
  if (!teacherId) return;
  const teacher = await User.findOne({ _id: teacherId, role: ROLES.TEACHER, status: USER_STATUS.ACTIVE });
  if (!teacher) throw ApiError.badRequest('Selected teacher is not an active teacher', [
    { field: 'assignedTeacher', message: 'Not an active teacher' },
  ]);
};

/** Scope filter: teachers only ever see students assigned to them. */
const scopeFor = (actor) => (actor.role === ROLES.TEACHER ? { assignedTeacher: actor._id } : {});

const buildFilter = async (query, actor) => {
  const filter = { ...scopeFor(actor) };
  if (query.course) filter.course = new RegExp(`^${escapeRegex(query.course)}$`, 'i');
  if (query.status) filter.status = query.status;
  if (query.year) filter.year = query.year;
  if (query.teacher && actor.role === ROLES.ADMIN) filter.assignedTeacher = query.teacher;
  if (query.unassigned && actor.role === ROLES.ADMIN) filter.assignedTeacher = { $exists: false };

  if (query.search) {
    const regex = searchRegex(query.search);
    const users = await User.find({ role: ROLES.STUDENT, $or: [{ name: regex }, { email: regex }] }).select('_id');
    filter.$or = [{ rollNumber: regex }, { course: regex }, { user: { $in: users.map((u) => u._id) } }];
  }
  return filter;
};

const list = async (query, actor) => {
  const { page, limit, skip } = getPagination(query);
  const filter = await buildFilter(query, actor);

  const [students, total] = await Promise.all([
    Student.find(filter).populate(STUDENT_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);
  return { students, meta: buildMeta({ page, limit, total }) };
};

const getById = async (id, actor) => {
  const student = await Student.findOne({ _id: id, ...scopeFor(actor) }).populate(STUDENT_POPULATE);
  if (!student) throw ApiError.notFound('Student not found');
  return student;
};

const getByUser = async (userId) => {
  const student = await Student.findOne({ user: userId }).populate(STUDENT_POPULATE);
  if (!student) throw ApiError.notFound('Student profile not found');
  return student;
};

/** Creates the login account and the student profile together. */
const create = async (payload) => {
  const { user: userData, student: studentData } = splitPayload(payload);
  await assertTeacher(studentData.assignedTeacher);

  if (await User.exists({ email: userData.email })) {
    throw ApiError.conflict('Email is already in use', [{ field: 'email', message: 'Already in use' }]);
  }

  const user = await User.create({ ...userData, role: ROLES.STUDENT, status: USER_STATUS.ACTIVE });
  try {
    const student = await Student.create({ ...studentData, user: user._id, rollNumber: await generateRollNumber() });
    return student.populate(STUDENT_POPULATE);
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // keep data consistent if profile creation fails
    throw err;
  }
};

const update = async (id, payload) => {
  const { user: userData, student: studentData } = splitPayload(payload);
  const student = await Student.findById(id);
  if (!student) throw ApiError.notFound('Student not found');

  if (studentData.assignedTeacher === null) {
    student.assignedTeacher = undefined;
    delete studentData.assignedTeacher;
  } else {
    await assertTeacher(studentData.assignedTeacher);
  }

  Object.assign(student, studentData);
  await student.save();
  if (Object.keys(userData).length) await User.updateOne({ _id: student.user }, userData, { runValidators: true });

  return student.populate(STUDENT_POPULATE);
};

const updateAcademic = async (id, payload, actor) => {
  const student = await Student.findOne({ _id: id, ...scopeFor(actor) });
  if (!student) throw ApiError.notFound('Student not found');
  Object.assign(student, payload);
  await student.save();
  return student.populate(STUDENT_POPULATE);
};

const updateMe = async (userId, payload) => {
  const { user: userData, student: studentData } = splitPayload(payload);
  const student = await Student.findOne({ user: userId });
  if (!student) throw ApiError.notFound('Student profile not found');
  Object.assign(student, studentData);
  await student.save();
  if (Object.keys(userData).length) await User.updateOne({ _id: userId }, userData);
  return student.populate(STUDENT_POPULATE);
};

const remove = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw ApiError.notFound('Student not found');
  await Promise.all([student.deleteOne(), User.deleteOne({ _id: student.user })]);
};

const listCourses = () => Student.distinct('course');

const bulkAssign = async ({ ids, assignedTeacher }) => {
  await assertTeacher(assignedTeacher);
  const update = assignedTeacher ? { assignedTeacher } : { $unset: { assignedTeacher: 1 } };
  const result = await Student.updateMany({ _id: { $in: ids } }, update);
  return { matched: result.matchedCount, modified: result.modifiedCount };
};

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV of every student matching the filters (no pagination). */
const exportCsv = async (query, actor) => {
  const filter = await buildFilter(query, actor);
  const students = await Student.find(filter).populate(STUDENT_POPULATE).sort({ rollNumber: 1 });
  const header = ['Roll number', 'Name', 'Email', 'Phone', 'Course', 'Year', 'Status', 'Teacher', 'Attendance %', 'Average score', 'Guardian', 'Guardian phone', 'Joined'];
  const rows = students.map((s) => [
    s.rollNumber, s.user?.name, s.user?.email, s.user?.phone, s.course, s.year, s.status, s.assignedTeacher?.name,
    s.attendancePercent ?? '', s.averageScore ?? '', s.guardianName, s.guardianPhone, s.createdAt.toISOString().slice(0, 10),
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
};

module.exports = { list, getById, getByUser, create, update, updateAcademic, updateMe, remove, listCourses, bulkAssign, exportCsv };
