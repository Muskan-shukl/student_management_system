const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u;

const nameField = z
  .string({ message: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name must be at most 60 characters')
  .regex(NAME_PATTERN, 'Name can only contain letters, spaces, apostrophes, hyphens and periods');

const emailField = z.email({ message: 'Enter a valid email address' }).trim().toLowerCase();

const passwordField = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/\d/, 'Password must contain a number');

// Exactly 10 digits, starting 6-9 (Indian mobile number), digits only.
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const phoneField = z
  .string()
  .trim()
  .max(10, 'Phone number must be exactly 10 digits')
  .regex(PHONE_PATTERN, 'Enter a valid 10-digit phone number')
  .or(z.literal(''))
  .optional();

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/** 'YYYY-MM-DD' → Date at UTC midnight */
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .transform((v) => new Date(`${v}T00:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), 'Invalid date');

const monthField = z.string().regex(/^\d{4}-\d{2}$/, 'Use the format YYYY-MM');
const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use the format HH:MM');

module.exports = { objectId, nameField, emailField, passwordField, phoneField, paginationQuery, dateOnly, monthField, timeField, NAME_PATTERN };
