const ApiError = require('../utils/ApiError');

/**
 * Validates req.body / req.query / req.params against Zod schemas.
 * Parsed (typed + trimmed + coerced) values are exposed on `req.validated`.
 *
 * usage: validate({ body: zodSchema, query: zodSchema, params: zodSchema })
 */
const validate = (schemas) => (req, res, next) => {
  const errors = [];
  req.validated = {};

  for (const location of ['params', 'query', 'body']) {
    const schema = schemas[location];
    if (!schema) continue;

    const result = schema.safeParse(req[location] ?? {});
    if (result.success) {
      req.validated[location] = result.data;
    } else {
      for (const issue of result.error.issues) {
        errors.push({ field: issue.path.join('.') || location, message: issue.message });
      }
    }
  }

  if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};

module.exports = validate;
