const { z } = require('zod');
const { ATTENDANCE_STATUS } = require('../../config/constants');
const { objectId, dateOnly, monthField } = require('../../utils/zod');

const sheet = { query: z.object({ date: dateOnly }) };

const mark = {
  body: z.object({
    date: dateOnly.refine((d) => d <= new Date(), 'Cannot mark attendance for a future date'),
    entries: z.array(z.object({ student: objectId, status: z.enum(ATTENDANCE_STATUS) })).min(1, 'Mark at least one student').max(500),
  }),
};

const history = { params: z.object({ id: objectId }), query: z.object({ month: monthField.optional() }) };
const me = { query: z.object({ month: monthField.optional() }) };

const overview = { query: z.object({ date: dateOnly.optional() }) };

module.exports = { sheet, mark, history, me, overview };
