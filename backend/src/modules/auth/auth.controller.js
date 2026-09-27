const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');

const signup = asyncHandler(async (req, res) => {
  const { user, token, pending } = await authService.signup(req.validated.body);
  sendResponse(res, {
    statusCode: 201,
    message: pending ? 'Account created. An admin will approve it shortly' : 'Account created',
    data: { user, token, pending },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.validated.body);
  sendResponse(res, { message: 'Logged in', data: { user, token } });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user);
  sendResponse(res, { message: 'Logged out' });
});

const me = (req, res) => sendResponse(res, { message: 'Current user', data: req.user });

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user, req.validated.body);
  sendResponse(res, { message: 'Profile updated', data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { user, token } = await authService.changePassword(req.user._id, req.validated.body);
  sendResponse(res, { message: 'Password changed', data: { user, token } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validated.body.email);
  sendResponse(res, { message: 'If an account exists for that email, a reset link has been sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validated.body);
  sendResponse(res, { message: 'Password reset. You can now sign in' });
});

module.exports = { signup, login, logout, me, updateProfile, changePassword, forgotPassword, resetPassword };
