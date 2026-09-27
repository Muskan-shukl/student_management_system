const { User } = require('./user.model');
const { Student } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { searchRegex } = require('../../utils/regex');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { ROLES, USER_STATUS } = require('../../config/constants');

const list = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = searchRegex(query.search);
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, meta: buildMeta({ page, limit, total }) };
};

const listTeachers = () =>
  User.find({ role: ROLES.TEACHER, status: USER_STATUS.ACTIVE }).select('name email department').sort({ name: 1 });

const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

/** Only one admin account may exist at a time. */
const adminExists = () => User.exists({ role: ROLES.ADMIN });

const create = async (payload) => {
  if (payload.role === ROLES.ADMIN && (await adminExists())) {
    throw ApiError.badRequest('An administrator account already exists. Only one admin is allowed.');
  }
  return User.create({ ...payload, status: USER_STATUS.ACTIVE });
};

const update = async (id, payload, actor) => {
  const user = await getById(id);
  const isSelf = user.id === actor.id;

  if (isSelf && payload.role && payload.role !== actor.role) {
    throw ApiError.forbidden('You cannot change your own role');
  }
  if (isSelf && payload.status && payload.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('You cannot deactivate your own account');
  }
  if (user.role === ROLES.STUDENT && payload.role) {
    throw ApiError.badRequest('A student account cannot be converted to a staff role');
  }
  if (payload.role === ROLES.ADMIN && user.role !== ROLES.ADMIN && (await adminExists())) {
    throw ApiError.badRequest('An administrator account already exists. Only one admin is allowed.');
  }

  // If a teacher is disabled or demoted, release their students.
  const losesTeacherRole =
    user.role === ROLES.TEACHER &&
    ((payload.role && payload.role !== ROLES.TEACHER) || (payload.status && payload.status !== USER_STATUS.ACTIVE));

  Object.assign(user, payload);
  if (payload.status && payload.status !== USER_STATUS.ACTIVE) user.tokenVersion += 1; // force logout
  await user.save();

  if (losesTeacherRole) await Student.updateMany({ assignedTeacher: user._id }, { $unset: { assignedTeacher: 1 } });
  return user;
};

const remove = async (id, actor) => {
  if (id === actor.id) throw ApiError.forbidden('You cannot delete your own account');
  const user = await getById(id);

  if (user.role === ROLES.STUDENT) await Student.deleteOne({ user: user._id });
  if (user.role === ROLES.TEACHER) {
    await Student.updateMany({ assignedTeacher: user._id }, { $unset: { assignedTeacher: 1 } });
  }
  await user.deleteOne();
};

/** Admin sets a temporary password; every existing session of that user is signed out. */
const resetPassword = async (id, password, actor) => {
  if (id === actor.id) throw ApiError.forbidden('Change your own password from Settings');
  const user = await getById(id);
  user.password = password;
  user.tokenVersion += 1;
  await user.save();
  return user;
};

module.exports = { list, listTeachers, getById, create, update, remove, resetPassword };
