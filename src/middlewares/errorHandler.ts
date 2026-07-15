// ==========================================
// StarNova API - Global Error Handler
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { errorResponse } from '../utils/helpers';
import config from '../config';

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Not Found handler
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Global error handler
export const errorHandler = (
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorType = 'ServerError';

  // ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorType = 'ApiError';
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errorType = 'ValidationError';
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(statusCode).json({
      success: false,
      message,
      error: errorType,
      details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errorType = 'MongooseValidationError';
  }

  // Mongoose Duplicate Key Error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    errorType = 'DuplicateError';
    const field = Object.keys((err as any).keyValue || {}).join(', ');
    message = `Duplicate value for: ${field}`;
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorType = 'CastError';
  }

  // Mongoose Document not found
  if (err.name === 'DocumentNotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    errorType = 'NotFoundError';
  }

  // Log error
  if (statusCode === 500) {
    logger.error(`[${errorType}] ${err.message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`[${errorType}] ${err.message}`, {
      path: req.originalUrl,
      method: req.method,
    });
  }

  // Send response
  const response = errorResponse(message, errorType, statusCode);

  if (config.nodeEnv === 'development' && statusCode === 500) {
    (response as any).stack = err.stack;
  }

  res.status(statusCode).json(response);
};
