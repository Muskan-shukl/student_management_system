const { z } = require('zod');
const { DAYS } = require('../../config/constants');
const { objectId, timeField } = require('../../utils/zod');

const fields = {
  course: z.string().trim().min(2, 'Course is required').max(100),
  year: z.coerce.number().int().min(1).max(6),
  day: z.enum(DAYS),
  startTime: timeField,
  endTime: timeField,
  subject: z.string().trim().min(1, 'Subject is required').max(60),
  room: z.string().trim().max(40).or(z.literal('')).optional(),
  teacher: objectId.or(z.literal('')).optional(),
};
const orderCheck = { message: 'End time must be after start time', path: ['endTime'] };

const list = { query: z.object({ course: z.string().trim().optional(), year: z.coerce.number().int().min(1).max(6).optional(), teacher: objectId.optional() }) };
const create = { body: z.object(fields).refine((s) => s.endTime > s.startTime, orderCheck) };
const update = {
  params: z.object({ id: objectId }),
  body: z.object(Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.optional()])))
    .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' })
    .refine((s) => !(s.startTime && s.endTime) || s.endTime > s.startTime, orderCheck),
};
const byId = { params: z.object({ id: objectId }) };

module.exports = { list, create, update, byId };
