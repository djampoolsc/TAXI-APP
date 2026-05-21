import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino();

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class BadRequest extends Error implements ApiError {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequest';
  }
}

export class Unauthorized extends Error implements ApiError {
  status = 401;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'Unauthorized';
  }
}

export class Forbidden extends Error implements ApiError {
  status = 403;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'Forbidden';
  }
}

export class NotFound extends Error implements ApiError {
  status = 404;

  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFound';
  }
}

export class InternalServerError extends Error implements ApiError {
  status = 500;

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error({
    error: err.name,
    status,
    message,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    error: err.name,
    message,
    status,
  });
}
