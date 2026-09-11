/**
 * AppError — Custom application error class
 *
 * Extends the native Error to carry HTTP status codes and error codes.
 * All thrown application errors should use this class.
 */

class AppError extends Error {
  /**
   * @param {string}  message    - Human-readable error message
   * @param {number}  statusCode - HTTP status code (default: 500)
   * @param {string}  code       - Machine-readable error code (e.g. 'NOT_FOUND')
   * @param {boolean} isOperational - True = expected/operational error; false = programming error
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name       = 'AppError';
    this.statusCode = statusCode;
    this.code       = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Convenience static factory methods ──────────────────────────────────────

  static badRequest(message = 'Bad request.', code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Authentication required.', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Access denied.', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Requested resource was not found.', code = 'RESOURCE_NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message = 'Resource already exists.', code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static internal(message = 'An unexpected error occurred.', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code, false);
  }
}

module.exports = AppError;
