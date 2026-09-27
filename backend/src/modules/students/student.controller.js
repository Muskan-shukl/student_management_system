const studentService = require('./student.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');

const listStudents = asyncHandler(async (req, res) => {
  const { students, meta } = await studentService.list(req.validated.query, req.user);
  sendResponse(res, { message: 'Students fetched', data: students, meta });
});

const listCourses = asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Courses fetched', data: await studentService.listCourses() });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getById(req.validated.params.id, req.user);
  sendResponse(res, { message: 'Student fetched', data: student });
});

const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Profile fetched', data: await studentService.getByUser(req.user._id) });
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.create(req.validated.body);
  sendResponse(res, { statusCode: 201, message: 'Student created', data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.update(req.validated.params.id, req.validated.body);
  sendResponse(res, { message: 'Student updated', data: student });
});

const updateAcademic = asyncHandler(async (req, res) => {
  const student = await studentService.updateAcademic(req.validated.params.id, req.validated.body, req.user);
  sendResponse(res, { message: 'Academic record updated', data: student });
});

const updateMe = asyncHandler(async (req, res) => {
  const student = await studentService.updateMe(req.user._id, req.validated.body);
  sendResponse(res, { message: 'Profile updated', data: student });
});

const bulkAssign = asyncHandler(async (req, res) => {
  const result = await studentService.bulkAssign(req.validated.body);
  sendResponse(res, { message: `${result.modified} student${result.modified === 1 ? '' : 's'} updated`, data: result });
});

const exportCsv = asyncHandler(async (req, res) => {
  const csv = await studentService.exportCsv(req.validated.query, req.user);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="students-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.remove(req.validated.params.id);
  sendResponse(res, { message: 'Student deleted' });
});

module.exports = {
  listStudents,
  listCourses,
  getStudent,
  getMe,
  createStudent,
  updateStudent,
  updateAcademic,
  updateMe,
  deleteStudent,
  bulkAssign,
  exportCsv,
};
