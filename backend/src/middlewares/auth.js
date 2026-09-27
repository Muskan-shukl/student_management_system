const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../modules/users/user.model');
const { USER_STATUS } = require('../config/constants');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

/** Verifies the JWT, loads the user and attaches it to req.user. */
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Session is invalid or has expired');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tv) {
    throw ApiError.unauthorized('Session is no longer valid, please log in again');
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('Your account is not active');
  }

  req.user = user;
  next();
});

/** Restricts a route to the given roles. Must run after `authenticate`. */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

module.exports = { authenticate, authorize };
