/**
 * Utility functions for consistent API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {*} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {*} error - Error details
 * @param {Number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (error !== null) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, "Validation failed", { validationErrors: errors }, 400);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name that was not found
 */
const notFoundResponse = (res, resource = "Resource") => {
  return errorResponse(res, `${resource} not found`, null, 404);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, null, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Forbidden message
 */
const forbiddenResponse = (res, message = "Access forbidden") => {
  return errorResponse(res, message, null, 403);
};

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {*} error - Error details
 */
const serverErrorResponse = (res, message = "Internal server error", error = null) => {
  return errorResponse(res, message, error, 500);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse
};