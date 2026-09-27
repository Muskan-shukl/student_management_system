const { Router } = require('express');
const service = require('./announcement.service');
const schema = require('./announcement.validation');
const validate = require('../../middlewares/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);

router.get('/', validate(schema.list), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.validated.query, req.user);
  sendResponse(res, { message: 'Announcements fetched', data: items, meta });
}));

router.post('/', authorize(ROLES.ADMIN, ROLES.TEACHER), validate(schema.create), asyncHandler(async (req, res) => {
  sendResponse(res, { statusCode: 201, message: 'Announcement posted', data: await service.create(req.validated.body, req.user) });
}));

router.patch('/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), validate(schema.update), asyncHandler(async (req, res) => {
  sendResponse(res, { message: 'Announcement updated', data: await service.update(req.validated.params.id, req.validated.body, req.user) });
}));

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), validate(schema.byId), asyncHandler(async (req, res) => {
  await service.remove(req.validated.params.id, req.user);
  sendResponse(res, { message: 'Announcement deleted' });
}));

module.exports = router;
