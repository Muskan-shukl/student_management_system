const { Router } = require('express');
const controller = require('./student.controller');
const schema = require('./student.validation');
const validate = require('../../middlewares/validate');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../config/constants');

const router = Router();
const { ADMIN, TEACHER, STUDENT } = ROLES;

router.use(authenticate);

// Student: own profile
router
  .route('/me')
  .get(authorize(STUDENT), controller.getMe)
  .patch(authorize(STUDENT), validate(schema.updateMe), controller.updateMe);

router.get('/courses', authorize(ADMIN, TEACHER), controller.listCourses);
router.get('/export', authorize(ADMIN, TEACHER), validate(schema.exportQuery), controller.exportCsv);
router.patch('/bulk-assign', authorize(ADMIN), validate(schema.bulkAssign), controller.bulkAssign);

router
  .route('/')
  .get(authorize(ADMIN, TEACHER), validate(schema.listStudents), controller.listStudents)
  .post(authorize(ADMIN), validate(schema.createStudent), controller.createStudent);

router.patch('/:id/academic', authorize(ADMIN, TEACHER), validate(schema.updateAcademic), controller.updateAcademic);

router
  .route('/:id')
  .get(authorize(ADMIN, TEACHER), validate(schema.studentId), controller.getStudent)
  .patch(authorize(ADMIN), validate(schema.updateStudent), controller.updateStudent)
  .delete(authorize(ADMIN), validate(schema.studentId), controller.deleteStudent);

module.exports = router;
