// ==========================================
// StarNova API - Validation Middleware
// ==========================================

import { Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/helpers';

// Zod validation middleware
export const validate = (schema: AnyZodObject) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'ValidationError',
          details,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
};

// Body validation only
export const validateBody = (schema: z.ZodObject<any>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'ValidationError',
          details,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
};

// Query validation only
export const validateQuery = (schema: z.ZodObject<any>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'ValidationError',
          details,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
};

// Params validation only
export const validateParams = (schema: z.ZodObject<any>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'ValidationError',
          details,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
};
