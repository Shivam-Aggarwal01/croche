// Utility functions for API responses

/**
 * Send a standardized success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error response
 */
const sendError = (res, message, statusCode = 400, details = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

module.exports = { sendSuccess, sendError };
