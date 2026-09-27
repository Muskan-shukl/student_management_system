const { z } = require('zod');
const { SUBMISSION_STATUS } = require('../../config/constants');
const { objectId, paginationQuery, dateOnly } = require('../../utils/zod');

const fields = {
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().max(2000).or(z.literal('')).optional(),
  subject: z.string().trim().min(1, 'Subject is required').max(60),
  dueDate: dateOnly,
  course: z.string().trim().max(100).or(z.literal('')).optional(),
};

const list = { query: paginationQuery.extend({ status: z.enum(['pending', 'submitted', 'checked', 'overdue']).optional() }) };
const create = { body: z.object(fields) };
const update = {
  params: z.object({ id: objectId }),
  body: z.object({ title: fields.title.optional(), description: fields.description, subject: fields.subject.optional(), dueDate: fields.dueDate.optional(), course: fields.course })
    .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' }),
};
const byId = { params: z.object({ id: objectId }) };
const submit = { params: z.object({ id: objectId }), body: z.object({ note: z.string().trim().max(500).or(z.literal('')).optional() }) };
const review = {
  params: z.object({ id: objectId, studentId: objectId }),
  body: z.object({ status: z.enum(SUBMISSION_STATUS) }),
};

module.exports = { list, create, update, byId, submit, review };
