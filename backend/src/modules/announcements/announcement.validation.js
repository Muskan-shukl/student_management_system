const { z } = require('zod');
const { AUDIENCES } = require('../../config/constants');
const { objectId, paginationQuery } = require('../../utils/zod');

const fields = {
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  body: z.string().trim().min(3, 'Message must be at least 3 characters').max(2000),
  audience: z.enum(AUDIENCES),
  course: z.string().trim().max(100).or(z.literal('')).optional(),
  pinned: z.boolean().optional(),
};

const list = { query: paginationQuery };
const create = { body: z.object({ ...fields, audience: fields.audience.default('all') }) };
const update = {
  params: z.object({ id: objectId }),
  body: z.object({ title: fields.title.optional(), body: fields.body.optional(), audience: fields.audience.optional(), course: fields.course, pinned: fields.pinned })
    .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' }),
};
const byId = { params: z.object({ id: objectId }) };

module.exports = { list, create, update, byId };
