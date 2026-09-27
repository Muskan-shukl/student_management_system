const { Router } = require('express');
const dashboardService = require('./dashboard.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/ApiResponse');
const { authenticate } = require('../../middlewares/auth');

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.getForUser(req.user);
    sendResponse(res, { message: 'Dashboard fetched', data: { role: req.user.role, ...data } });
  })
);

module.exports = router;
