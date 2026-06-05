import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  adminId?: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('⚠️  JWT_SECRET not set — using insecure fallback (development only)');
    return 'dev-only-insecure-secret';
  }
  return secret;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { adminId: number };
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export { getJwtSecret };
