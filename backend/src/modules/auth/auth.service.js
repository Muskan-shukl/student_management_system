const crypto = require('crypto');
const { User } = require('../users/user.model');
const env = require('../../config/env');
const { sendPasswordReset } = require('../../utils/mailer');
const { Student, generateRollNumber } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/jwt');
const { ROLES, USER_STATUS } = require('../../config/constants');

const EMAIL_TAKEN = ApiError.conflict('An account with this email already exists', [
  { field: 'email', message: 'Already registered' },
]);

const signup = async (payload) => {
  if (await User.exists({ email: payload.email })) throw EMAIL_TAKEN;

  const { course, year, ...userData } = payload;
  const isStudent = payload.role === ROLES.STUDENT;

  const user = await User.create({
    ...userData,
    status: isStudent ? USER_STATUS.ACTIVE : USER_STATUS.PENDING,
  });

  if (isStudent) {
    try {
      await Student.create({ user: user._id, course, year, rollNumber: await generateRollNumber() });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }
    user.lastLoginAt = new Date();
    await user.save();
    return { user, token: signToken(user), pending: false };
  }

  return { user, token: null, pending: true };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.comparePassword(password));
  if (!valid) throw ApiError.unauthorized('Incorrect email or password');

  if (user.status === USER_STATUS.PENDING) {
    throw ApiError.forbidden('Your account is awaiting admin approval');
  }
  if (user.status === USER_STATUS.DISABLED) {
    throw ApiError.forbidden('Your account has been disabled. Contact an administrator');
  }

  user.lastLoginAt = new Date();
  await user.save();
  return { user, token: signToken(user) };
};

/** Invalidates every token issued so far for this user. */
const logout = async (user) => {
  user.tokenVersion += 1;
  await user.save();
};

const updateProfile = async (user, payload) => {
  if (payload.department !== undefined && user.role !== ROLES.TEACHER) delete payload.department;
  Object.assign(user, payload);
  await user.save();
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect', [
      { field: 'currentPassword', message: 'Incorrect password' },
    ]);
  }
  user.password = newPassword;
  user.tokenVersion += 1; // log out other sessions
  await user.save();
  return { user, token: signToken(user) };
};

const RESET_TTL_MS = 30 * 60 * 1000;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Always resolves (even for unknown emails) so the endpoint can't be used to
 * discover which addresses are registered.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordReset = { tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) };
  await user.save();

  await sendPasswordReset({
    to: user.email,
    name: user.name,
    link: `${env.appUrl}/reset-password?token=${token}`,
    expiresInMinutes: RESET_TTL_MS / 60000,
  });
};

const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    'passwordReset.tokenHash': hashToken(token),
    'passwordReset.expiresAt': { $gt: new Date() },
  }).select('+passwordReset.tokenHash +passwordReset.expiresAt');
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');

  user.password = password;
  user.passwordReset = undefined;
  user.tokenVersion += 1; // sign out every existing session
  await user.save();
};

module.exports = { signup, login, logout, updateProfile, changePassword, forgotPassword, resetPassword };
