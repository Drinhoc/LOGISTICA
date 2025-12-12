import { type NextFunction, type Request, type Response } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as AppError).statusCode ?? 500;
  const message = err.message || 'Internal server error';

  console.error(`[Error] ${req.method} ${req.originalUrl}: ${message}`);

  res.status(status).json({ message });
};
