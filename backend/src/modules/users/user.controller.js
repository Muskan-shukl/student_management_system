const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');

const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.list(req.validated.query);
  sendResponse(res, { message: 'Users fetched', data: users, meta });
});

const listTeachers = asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Teachers fetched', data: await userService.listTeachers() });
});

const getUser = asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'User fetched', data: await userService.getById(req.validated.params.id) });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.create(req.validated.body);
  sendResponse(res, { statusCode: 201, message: 'User created', data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.update(req.validated.params.id, req.validated.body, req.user);
  sendResponse(res, { message: 'User updated', data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.remove(req.validated.params.id, req.user);
  sendResponse(res, { message: 'User deleted' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await userService.resetPassword(req.validated.params.id, req.validated.body.password, req.user);
  sendResponse(res, { message: 'Temporary password set. The user has been signed out everywhere', data: user });
});

module.exports = { listUsers, listTeachers, getUser, createUser, updateUser, deleteUser, resetPassword };
