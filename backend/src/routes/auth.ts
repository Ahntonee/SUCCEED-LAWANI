import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../db/prisma';
import { requireAuth, AuthRequest, getJwtSecret } from '../middleware/auth';

const router = Router();

// Rate limit: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ adminId: admin.id }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.update({ where: { id: req.adminId }, data });
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
