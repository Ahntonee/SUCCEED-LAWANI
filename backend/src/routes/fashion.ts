import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/', wrapAsync(async (req, res) => {
  const { name, email, phone, garmentType, measurements, budget, notes } = req.body || {};
  if (!name || !email) { res.status(400).json({ error: 'Name and email required' }); return; }
  const inquiry = await prisma.fashionInquiry.create({
    data: {
      name,
      email,
      phone: phone || '',
      garmentType: garmentType || '',
      measurements: measurements || '',
      budget: budget || '',
      notes: notes || '',
    },
  });
  res.status(201).json({ success: true, id: inquiry.id });
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, wrapAsync(async (req, res) => {
  const { status } = req.query;
  const where = status ? { status: String(status) } : {};
  const inquiries = await prisma.fashionInquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(inquiries);
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const inquiry = await prisma.fashionInquiry.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(inquiry);
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.fashionInquiry.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

export default router;
