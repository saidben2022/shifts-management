import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'QueryFailedError') {
    return res.status(500).json({
      message: 'Database error occurred',
      error: err.message
    });
  }

  if (err.name === 'EntityNotFoundError') {
    return res.status(404).json({
      message: 'Resource not found',
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};
