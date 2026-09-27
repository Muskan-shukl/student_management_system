const { Router } = require('express');
const controller = require('./auth.controller');
const schema = require('./auth.validation');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');
const { authLimiter } = require('../../middlewares/rateLimit');

const router = Router();

router.post('/signup', authLimiter, validate(schema.signup), controller.signup);
router.post('/login', authLimiter, validate(schema.login), controller.login);
router.post('/forgot-password', authLimiter, validate(schema.forgotPassword), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(schema.resetPassword), controller.resetPassword);

router.use(authenticate);
router.post('/logout', controller.logout);
router.get('/me', controller.me);
router.patch('/me', validate(schema.updateProfile), controller.updateProfile);
router.patch('/password', validate(schema.changePassword), controller.changePassword);

module.exports = router;
