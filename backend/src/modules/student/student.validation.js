const { GENDERS, STATUSES } = require('./student.model');

const objectId = { type: 'string', pattern: /^[a-f\d]{24}$/i, required: true };

const baseFields = {
  rollNumber: { type: 'string', trim: true, min: 1, max: 20 },
  firstName: { type: 'string', trim: true, min: 1, max: 50 },
  lastName: { type: 'string', trim: true, min: 1, max: 50 },
  email: { type: 'email', trim: true },
  phone: { type: 'string', trim: true, pattern: /^\+?[\d\s-]{7,15}$/ },
  dateOfBirth: { type: 'date' },
  gender: { type: 'string', enum: GENDERS },
  course: { type: 'string', trim: true, min: 1, max: 100 },
  year: { type: 'number', min: 1, max: 6 },
  address: { type: 'string', trim: true, max: 255 },
  status: { type: 'string', enum: STATUSES },
};

const withRequired = (fields, requiredKeys) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, rule]) => [key, { ...rule, required: requiredKeys.includes(key) }])
  );

const createStudent = {
  body: withRequired(baseFields, ['rollNumber', 'firstName', 'lastName', 'email', 'course']),
};

const updateStudent = {
  params: { id: objectId },
  body: baseFields,
};

const studentId = {
  params: { id: objectId },
};

const listStudents = {
  query: {
    page: { type: 'string', pattern: /^\d+$/ },
    limit: { type: 'string', pattern: /^\d+$/ },
    search: { type: 'string', trim: true, max: 100 },
    course: { type: 'string', trim: true },
    status: { type: 'string', enum: STATUSES },
    year: { type: 'string', pattern: /^[1-6]$/ },
  },
};

module.exports = { createStudent, updateStudent, studentId, listStudents };
