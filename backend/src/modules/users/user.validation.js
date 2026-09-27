const { z } = require('zod');
const { ROLES, USER_STATUS_LIST } = require('../../config/constants');
const { objectId, paginationQuery, nameField, emailField, passwordField, phoneField } = require('../../utils/zod');

const staffRole = z.enum([ROLES.ADMIN, ROLES.TEACHER], { message: 'Role must be admin or teacher' });

const listUsers = {
  query: paginationQuery.extend({
    role: z.enum([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]).optional(),
    status: z.enum(USER_STATUS_LIST).optional(),
    search: z.string().trim().max(100).optional(),
  }),
};

const createUser = {
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    role: staffRole,
    phone: phoneField,
    department: z.string().trim().max(80).optional(),
  }),
};

const updateUser = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: nameField.optional(),
      role: staffRole.optional(),
      status: z.enum(USER_STATUS_LIST).optional(),
      phone: phoneField,
      department: z.string().trim().max(80).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' }),
};

const userId = { params: z.object({ id: objectId }) };

const resetPassword = { params: z.object({ id: objectId }), body: z.object({ password: passwordField }) };

module.exports = { listUsers, createUser, updateUser, userId, resetPassword };
