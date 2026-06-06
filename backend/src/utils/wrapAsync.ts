import { Request, Response } from 'express';

/**
 * Wraps an async route handler in try-catch.
 * Logs the error server-side and returns a safe 500 to the client.
 */
export function wrapAsync(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${req.method} ${req.path}] Error: ${msg}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
