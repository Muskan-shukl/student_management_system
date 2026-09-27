const { Router } = require('express');
const controller = require('./student.controller');
const schema = require('./student.validation');
const validate = require('../../middlewares/validate');

const router = Router();

router
  .route('/')
  .get(validate(schema.listStudents), controller.listStudents)
  .post(validate(schema.createStudent), controller.createStudent);

router
  .route('/:id')
  .get(validate(schema.studentId), controller.getStudent)
  .patch(validate(schema.updateStudent), controller.updateStudent)
  .delete(validate(schema.studentId), controller.deleteStudent);

module.exports = router;
