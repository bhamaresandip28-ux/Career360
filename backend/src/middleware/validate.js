/**
 * Validate middleware — wraps a Zod schema for request body validation.
 * Usage: router.post('/register', validate(registerSchema), controller)
 */

const { sendError } = require('../utils/apiResponse');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] || {});

  if (!result.success) {
    // ZodError stores field errors in .issues (not .errors)
    const fields = {};
    (result.error?.issues || []).forEach((issue) => {
      const field = issue.path.join('.') || 'input';
      if (!fields[field]) fields[field] = issue.message;
    });

    return sendError(res, 'VALIDATION_ERROR', 'Validation failed.', 400, { fields });
  }

  req[source] = result.data;
  return next();
};

module.exports = validate;
