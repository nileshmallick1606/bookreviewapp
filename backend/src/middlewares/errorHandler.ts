// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'error',
    data: null,
    error: {
      code: statusCode,
      message: err.message || 'Internal Server Error',
      errors: err.errors || null,
    },
  });
};
