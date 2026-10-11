/**
 * BakeUrCurl — Global Error Handler Middleware
 *
 * Must be registered LAST in the Express middleware chain.
 * Normalises Mongoose, JWT, and custom errors into a consistent JSON shape.
 */

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose — Bad ObjectId ──────────────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // ── Mongoose — Duplicate Key ─────────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}'. Please use a different value.`;
  }

  // ── Mongoose — Validation Error ──────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── JWT — Invalid Token ──────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  // ── JWT — Expired Token ──────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // ── Multer — File too large ──────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large. Maximum upload size is 5 MB.';
  }

  // Always log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`\n[ERROR] ${statusCode} — ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
