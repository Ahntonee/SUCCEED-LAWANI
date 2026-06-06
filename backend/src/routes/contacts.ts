import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/', wrapAsync(async (req, res) => {
  const { name, email, subject, inquiryType, message } = req.body || {};
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email and message are required' });
    return;
  }
  const contact = await prisma.contact.create({
    data: { name, email, subject: subject || '', inquiryType: inquiryType || 'other', message },
  });
  res.status(201).json({ success: true, id: contact.id });
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, wrapAsync(async (req, res) => {
  const { status, inquiryType } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (inquiryType) where.inquiryType = String(inquiryType);
  const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(contacts);
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const contact = await prisma.contact.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(contact);
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.contact.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

export default router;
