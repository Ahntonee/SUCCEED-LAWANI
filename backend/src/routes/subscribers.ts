import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';
import { addSubscriber } from '../services/gomailer';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/', wrapAsync(async (req, res) => {
  const { email, firstName } = req.body || {};
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Valid email required' });
    return;
  }

  const normalized = email.toLowerCase().trim();

  const sub = await prisma.subscriber.upsert({
    where: { email: normalized },
    update: { active: true },
    create: { email: normalized },
  });

  // Add to GoMailer list (fire-and-forget — DB save already succeeded)
  addSubscriber(normalized, firstName).catch((err) =>
    console.error('[GoMailer] Failed to add subscriber:', err)
  );

  res.status(201).json({ success: true, id: sub.id });
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, wrapAsync(async (_req, res) => {
  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(subs);
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.subscriber.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ success: true });
}));

export default router;
