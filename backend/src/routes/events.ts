import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// --- PUBLIC ---
router.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;
  const where = status && status !== 'all' ? { status: String(status) } : {};
  const events = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(events);
});

router.get('/:id', async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
  if (!event) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(event);
});

router.post('/:id/rsvp', async (req: Request, res: Response) => {
  const { name, email, phone, ticketCount } = req.body;
  if (!name || !email) { res.status(400).json({ error: 'Name and email required' }); return; }
  const rsvp = await prisma.rsvp.create({
    data: { eventId: Number(req.params.id), name, email, phone: phone || '', ticketCount: ticketCount || 1 },
  });
  res.status(201).json(rsvp);
});

// --- ADMIN ---
router.get('/:id/rsvps', requireAuth, async (req: Request, res: Response) => {
  const rsvps = await prisma.rsvp.findMany({
    where: { eventId: Number(req.params.id) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(rsvps);
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const event = await prisma.event.create({ data: req.body });
  res.status(201).json(event);
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const event = await prisma.event.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(event);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.patch('/:id/rsvps/:rsvpId', requireAuth, async (req: Request, res: Response) => {
  const rsvp = await prisma.rsvp.update({ where: { id: Number(req.params.rsvpId) }, data: req.body });
  res.json(rsvp);
});

export default router;
