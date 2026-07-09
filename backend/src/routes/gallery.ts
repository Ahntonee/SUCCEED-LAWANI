import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/', wrapAsync(async (_req, res) => {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  res.json(items);
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, wrapAsync(async (req, res) => {
  const { type, url, caption, order } = req.body || {};
  if (!url) { res.status(400).json({ error: 'URL is required' }); return; }
  const item = await prisma.galleryItem.create({
    data: { type: type || 'image', url, caption: caption || '', order: Number(order) || 0 },
  });
  res.status(201).json(item);
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const item = await prisma.galleryItem.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(item);
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.galleryItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

export default router;
