const { Router } = require('express');
const service = require('./assignment.service');
const schema = require('./assignment.validation');
const validate = require('../../middlewares/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();
const { ADMIN, TEACHER, STUDENT } = ROLES;
router.use(authenticate);

router.get('/', validate(schema.list), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.validated.query, req.user);
  sendResponse(res, { message: 'Assignments fetched', data: items, meta });
}));

router.post('/', authorize(TEACHER), validate(schema.create), asyncHandler(async (req, res) => {
  sendResponse(res, { statusCode: 201, message: 'Assignment created', data: await service.create(req.validated.body, req.user) });
}));

router.post('/:id/submit', authorize(STUDENT), validate(schema.submit), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Marked as submitted', data: await service.submit(req.validated.params.id, req.user, req.validated.body.note) });
}));

router.patch('/:id/submissions/:studentId', authorize(TEACHER, ADMIN), validate(schema.review), asyncHandler(async (req, res) => {
  const { id, studentId } = req.validated.params;
  sendResponse(res, { message: 'Submission updated', data: await service.review(id, studentId, req.validated.body.status, req.user) });
}));

router
  .route('/:id')
  .get(authorize(TEACHER, ADMIN), validate(schema.byId), asyncHandler(async (req, res) => {
    sendResponse(res, { message: 'Assignment fetched', data: await service.getForTeacher(req.validated.params.id, req.user) });
  }))
  .patch(authorize(TEACHER, ADMIN), validate(schema.update), asyncHandler(async (req, res) => {
    sendResponse(res, { message: 'Assignment updated', data: await service.update(req.validated.params.id, req.validated.body, req.user) });
  }))
  .delete(authorize(TEACHER, ADMIN), validate(schema.byId), asyncHandler(async (req, res) => {
    await service.remove(req.validated.params.id, req.user);
    sendResponse(res, { message: 'Assignment deleted' });
  }));

module.exports = router;
