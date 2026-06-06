import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/', wrapAsync(async (_req, res) => {
  const items = await prisma.siteContent.findMany();
  const map: Record<string, string> = {};
  items.forEach((i) => { map[i.key] = i.value; });
  res.json(map);
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.patch('/:key', requireAuth, wrapAsync(async (req, res) => {
  const { value } = req.body || {};
  if (value === undefined) { res.status(400).json({ error: 'Value required' }); return; }
  const item = await prisma.siteContent.upsert({
    where: { key: req.params.key },
    update: { value },
    create: { key: req.params.key, value },
  });
  res.json(item);
}));

router.patch('/', requireAuth, wrapAsync(async (req, res) => {
  const updates: Record<string, string> = req.body;
  if (!updates || typeof updates !== 'object') {
    res.status(400).json({ error: 'Body must be a key-value object' });
    return;
  }
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.siteContent.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  res.json({ success: true });
}));

export default router;
