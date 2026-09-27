const { Student } = require('./student.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, buildMeta } = require('../../utils/pagination');

const buildFilter = ({ search, course, status, year }) => {
  const filter = {};
  if (course) filter.course = new RegExp(`^${course}$`, 'i');
  if (status) filter.status = status;
  if (year) filter.year = Number(year);
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { rollNumber: regex }];
  }
  return filter;
};

const list = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter(query);

  const [students, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return { students, meta: buildMeta({ page, limit, total }) };
};

const getById = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw ApiError.notFound('Student not found');
  return student;
};

const create = (payload) => Student.create(payload);

const update = async (id, payload) => {
  const student = await Student.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!student) throw ApiError.notFound('Student not found');
  return student;
};

const remove = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw ApiError.notFound('Student not found');
  return student;
};

module.exports = { list, getById, create, update, remove };
