const { Router } = require('express');
const service = require('./timetable.service');
const schema = require('./timetable.validation');
const validate = require('../../middlewares/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();
const { ADMIN, TEACHER, STUDENT } = ROLES;
router.use(authenticate);

router.get('/me', authorize(STUDENT), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Timetable fetched', data: await service.mine(req.user) });
}));

router.get('/', authorize(ADMIN, TEACHER), validate(schema.list), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Timetable fetched', data: { today: service.todayKey(), slots: await service.list(req.validated.query) } });
}));

router.post('/', authorize(ADMIN, TEACHER), validate(schema.create), asyncHandler(async (req, res) => {
  sendResponse(res, { statusCode: 201, message: 'Class added', data: await service.create(req.validated.body) });
}));

router.patch('/:id', authorize(ADMIN, TEACHER), validate(schema.update), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Class updated', data: await service.update(req.validated.params.id, req.validated.body) });
}));

router.delete('/:id', authorize(ADMIN, TEACHER), validate(schema.byId), asyncHandler(async (req, res) => {
  await service.remove(req.validated.params.id);
  sendResponse(res, { message: 'Class removed' });
}));

module.exports = router;
