import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/', wrapAsync(async (req, res) => {
  const { status } = req.query;
  const where = status && status !== 'all' ? { status: String(status) } : {};
  const events = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(events);
}));

router.get('/:id', wrapAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid event ID' }); return; }
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
  res.json(event);
}));

router.post('/:id/rsvp', wrapAsync(async (req, res) => {
  const { name, email, phone, ticketCount } = req.body || {};
  if (!name || !email) { res.status(400).json({ error: 'Name and email required' }); return; }
  const eventId = Number(req.params.id);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
  const rsvp = await prisma.rsvp.create({
    data: { eventId, name, email, phone: phone || '', ticketCount: Number(ticketCount) || 1 },
  });
  res.status(201).json(rsvp);
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/:id/rsvps', requireAuth, wrapAsync(async (req, res) => {
  const rsvps = await prisma.rsvp.findMany({
    where: { eventId: Number(req.params.id) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(rsvps);
}));

router.post('/', requireAuth, wrapAsync(async (req, res) => {
  const event = await prisma.event.create({ data: req.body });
  res.status(201).json(event);
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const event = await prisma.event.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(event);
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

router.patch('/:id/rsvps/:rsvpId', requireAuth, wrapAsync(async (req, res) => {
  const rsvp = await prisma.rsvp.update({ where: { id: Number(req.params.rsvpId) }, data: req.body });
  res.json(rsvp);
}));

export default router;
