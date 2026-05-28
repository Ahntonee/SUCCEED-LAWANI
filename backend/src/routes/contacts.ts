import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// PUBLIC — submit contact form
router.post('/', async (req: Request, res: Response) => {
  const { name, email, subject, inquiryType, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email and message required' });
    return;
  }
  const contact = await prisma.contact.create({
    data: { name, email, subject: subject || '', inquiryType: inquiryType || 'other', message },
  });
  res.status(201).json({ success: true, id: contact.id });
});

// ADMIN — list all contacts
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { status, inquiryType } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status);
  if (inquiryType) where.inquiryType = String(inquiryType);
  const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(contacts);
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const contact = await prisma.contact.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(contact);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.contact.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
