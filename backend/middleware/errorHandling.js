const { errorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, "Validation Error", errors, 400);
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, "Duplicate entry error", "Record already exists", 409);
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, "Foreign key constraint error", "Referenced record does not exist", 400);
  }

  // MySQL connection error
  if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ECONNREFUSED') {
    return errorResponse(res, "Database connection error", "Unable to connect to database", 503);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, "Invalid token", "Authentication failed", 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, "Token expired", "Please login again", 401);
  }

  // Custom application errors
  if (err.status) {
    return errorResponse(res, err.message, err.details || null, err.status);
  }

  // Default server error
  return errorResponse(res, "Internal Server Error", process.env.NODE_ENV === 'development' ? err.message : null, 500);
};

/**
 * Not found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, null, 404);
};

/**
 * Async error wrapper
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};