const { Router } = require('express');
const controller = require('./user.controller');
const schema = require('./user.validation');
const validate = require('../../middlewares/validate');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/teachers', controller.listTeachers);
router.post('/:id/password', validate(schema.resetPassword), controller.resetPassword);

router
  .route('/')
  .get(validate(schema.listUsers), controller.listUsers)
  .post(validate(schema.createUser), controller.createUser);

router
  .route('/:id')
  .get(validate(schema.userId), controller.getUser)
  .patch(validate(schema.updateUser), controller.updateUser)
  .delete(validate(schema.userId), controller.deleteUser);

module.exports = router;
