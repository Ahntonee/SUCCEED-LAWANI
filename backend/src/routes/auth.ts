import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
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
  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  if (!admin) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.update({ where: { id: req.adminId }, data });
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

export default router;
