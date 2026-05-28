import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, garmentType, measurements, budget, notes } = req.body;
  if (!name || !email) { res.status(400).json({ error: 'Name and email required' }); return; }
  const inquiry = await prisma.fashionInquiry.create({
    data: { name, email, phone: phone || '', garmentType: garmentType || '', measurements: measurements || '', budget: budget || '', notes: notes || '' },
  });
  res.status(201).json({ success: true, id: inquiry.id });
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.query;
  const where = status ? { status: String(status) } : {};
  const inquiries = await prisma.fashionInquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(inquiries);
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const inquiry = await prisma.fashionInquiry.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(inquiry);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.fashionInquiry.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
