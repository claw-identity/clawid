import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : req.query;
      const parsed = schema.parse(data);
      if (source === 'body') {
        req.body = parsed;
      } else {
        req.query = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          },
        };
        res.status(400).json(response);
        return;
      }
      next(err);
    }
  };
}
