const { z } = require('zod');
const { STUDENT_STATUS_LIST, GENDERS } = require('../../config/constants');
const { objectId, paginationQuery, nameField, emailField, passwordField, phoneField } = require('../../utils/zod');

const courseField = z.string({ message: 'Course is required' }).trim().min(2, 'Course is required').max(100);
const yearField = z.coerce.number().int().min(1, 'Year must be 1–6').max(6, 'Year must be 1–6');
const dateField = z.coerce.date({ message: 'Enter a valid date' }).max(new Date(), 'Date cannot be in the future');
const guardianNameField = z
  .string()
  .trim()
  .max(60, 'Guardian name is too long')
  .regex(/^$|^\p{L}[\p{L}\s'.-]*$/u, 'Only letters, spaces, apostrophes, hyphens and periods are allowed');

const profileFields = {
  course: courseField,
  year: yearField,
  gender: z.enum(GENDERS, { message: 'Select a gender' }),
  dateOfBirth: dateField,
  address: z.string().trim().max(255),
  guardianName: guardianNameField,
  guardianPhone: phoneField,
};

const gradeSchema = z
  .object({
    subject: z.string().trim().min(1, 'Subject is required').max(60),
    score: z.coerce.number().min(0, 'Score cannot be negative'),
    maxScore: z.coerce.number().min(1, 'Max score must be at least 1').default(100),
  })
  .refine((g) => g.score <= g.maxScore, { message: 'Score cannot exceed max score', path: ['score'] });

const listStudents = {
  query: paginationQuery.extend({
    search: z.string().trim().max(100).optional(),
    course: z.string().trim().max(100).optional(),
    status: z.enum(STUDENT_STATUS_LIST).optional(),
    year: z.coerce.number().int().min(1).max(6).optional(),
    teacher: objectId.optional(),
    unassigned: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  }),
};

const createStudent = {
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    phone: phoneField,
    course: courseField,
    year: yearField.default(1),
    gender: profileFields.gender.optional(),
    dateOfBirth: dateField.optional(),
    address: profileFields.address.optional(),
    guardianName: profileFields.guardianName.optional(),
    guardianPhone: phoneField,
    assignedTeacher: objectId.optional(),
  }),
};

// Admin: any field except academic records.
const updateStudent = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: nameField.optional(),
      phone: phoneField,
      course: courseField.optional(),
      year: yearField.optional(),
      gender: profileFields.gender.optional(),
      dateOfBirth: dateField.optional(),
      address: profileFields.address.optional(),
      guardianName: profileFields.guardianName.optional(),
      guardianPhone: phoneField,
      status: z.enum(STUDENT_STATUS_LIST).optional(),
      assignedTeacher: objectId.nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
};

// Teacher (or admin): academic records only.
const updateAcademic = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      grades: z.array(gradeSchema).max(30).optional(),
      remarks: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
};

// Student: own contact details only.
const updateMe = {
  body: z
    .object({
      phone: phoneField,
      address: profileFields.address.optional(),
      dateOfBirth: dateField.optional(),
      gender: profileFields.gender.optional(),
      guardianName: profileFields.guardianName.optional(),
      guardianPhone: phoneField,
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
};

const studentId = { params: z.object({ id: objectId }) };

const bulkAssign = {
  body: z.object({
    ids: z.array(objectId).min(1, 'Select at least one student').max(200),
    assignedTeacher: objectId.nullable(),
  }),
};

const exportQuery = { query: listStudents.query.omit({ page: true, limit: true }) };

module.exports = { listStudents, createStudent, updateStudent, updateAcademic, updateMe, studentId, bulkAssign, exportQuery };
