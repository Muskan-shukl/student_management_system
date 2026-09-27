const studentService = require('./student.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');

const listStudents = asyncHandler(async (req, res) => {
  const { students, meta } = await studentService.list(req.query);
  sendResponse(res, { message: 'Students fetched', data: students, meta });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getById(req.params.id);
  sendResponse(res, { message: 'Student fetched', data: student });
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.create(req.body);
  sendResponse(res, { statusCode: 201, message: 'Student created', data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.update(req.params.id, req.body);
  sendResponse(res, { message: 'Student updated', data: student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.remove(req.params.id);
  sendResponse(res, { message: 'Student deleted' });
});

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
