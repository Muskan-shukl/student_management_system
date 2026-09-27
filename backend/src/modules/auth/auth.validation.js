const { z } = require('zod');
const { ROLES } = require('../../config/constants');
const { nameField, emailField, passwordField, phoneField } = require('../../utils/zod');

const base = { name: nameField, email: emailField, password: passwordField, phone: phoneField };

// Public signup: students are active immediately; teachers wait for admin approval.
const signup = {
  body: z.discriminatedUnion(
    'role',
    [
      z.object({
        ...base,
        role: z.literal(ROLES.STUDENT),
        course: z.string({ message: 'Course is required' }).trim().min(2, 'Course is required').max(100),
        year: z.coerce.number().int().min(1).max(6).default(1),
      }),
      z.object({
        ...base,
        role: z.literal(ROLES.TEACHER),
        department: z.string().trim().max(80).optional(),
      }),
    ],
    { message: 'Role must be student or teacher' }
  ),
};

const login = {
  body: z.object({
    email: emailField,
    password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
  }),
};

const updateProfile = {
  body: z
    .object({
      name: nameField.optional(),
      phone: phoneField,
      department: z.string().trim().max(80).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
};

const changePassword = {
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordField,
    })
    .refine((d) => d.currentPassword !== d.newPassword, {
      message: 'New password must be different from the current one',
      path: ['newPassword'],
    }),
};

const forgotPassword = { body: z.object({ email: emailField }) };

const resetPassword = {
  body: z.object({
    token: z.string().regex(/^[a-f\d]{64}$/i, 'Invalid reset token'),
    password: passwordField,
  }),
};

module.exports = { signup, login, updateProfile, changePassword, forgotPassword, resetPassword };
