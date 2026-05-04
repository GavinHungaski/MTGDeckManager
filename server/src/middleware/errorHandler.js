import logger from '../utils/logger.js';
import { config } from '../config/environment.js';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, code = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation error', details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Don't leak error details in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
  }

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'CONFLICT';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Related resource not found';
    code = 'FOREIGN_KEY_VIOLATION';
  }

  // Send response
  res.status(statusCode).json({
    error: message,
    code,
    ...(details && { details }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  errorHandler,
  notFoundHandler
};