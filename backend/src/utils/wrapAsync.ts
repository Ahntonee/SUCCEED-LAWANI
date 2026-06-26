import { NextFunction, Request, Response } from 'express';

/**
 * Wraps an async route handler and forwards unhandled errors to Express's
 * error-handling middleware (app.use((err, req, res, next) => ...)).
 */
export function wrapAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
