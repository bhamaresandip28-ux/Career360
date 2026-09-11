/**
 * API Response helpers
 * Provides consistent JSON response structures across all controllers.
 */

/**
 * Send a success response.
 * @param {Response} res
 * @param {object}   data        - The payload to return
 * @param {string}   [message]   - Optional human-readable message
 * @param {number}   [status=200] - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a created (201) response.
 */
const sendCreated = (res, data, message = 'Resource created successfully.') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a no-content (204) response.
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send an error response.
 * @param {Response} res
 * @param {string}   code       - Machine-readable error code
 * @param {string}   message    - Human-readable error message
 * @param {number}   [status=500] - HTTP status code
 * @param {object}   [details]  - Optional extra details (dev only)
 */
const sendError = (res, code, message, status = 500, details = null) => {
  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details && process.env.NODE_ENV !== 'production') {
    body.error.details = details;
  }

  return res.status(status).json(body);
};

module.exports = { sendSuccess, sendCreated, sendNoContent, sendError };
