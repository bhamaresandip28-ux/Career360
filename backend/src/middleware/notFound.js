/**
 * 404 Not Found middleware
 * Catches all requests that did not match any registered route.
 */

const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

module.exports = notFound;
