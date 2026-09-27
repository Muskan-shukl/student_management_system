const { Router } = require('express');
const service = require('./attendance.service');
const schema = require('./attendance.validation');
const validate = require('../../middlewares/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);

router.get('/me', authorize(ROLES.STUDENT), validate(schema.me), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Attendance fetched', data: await service.me(req.user, req.validated.query.month) });
}));

router.get('/overview', authorize(ROLES.ADMIN), validate(schema.overview), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Attendance overview fetched', data: await service.overview(req.validated.query.date) });
}));

router.get('/sheet', authorize(ROLES.TEACHER), validate(schema.sheet), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Attendance sheet fetched', data: await service.sheet(req.user, req.validated.query.date) });
}));

router.post('/mark', authorize(ROLES.TEACHER), validate(schema.mark), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Attendance saved', data: await service.mark(req.user, req.validated.body) });
}));

router.get('/student/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), validate(schema.history), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Attendance fetched', data: await service.history(req.validated.params.id, req.validated.query.month, req.user) });
}));

module.exports = router;
