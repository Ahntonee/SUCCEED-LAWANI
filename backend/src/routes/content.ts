import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// PUBLIC — get all site content as a key-value map
router.get('/', async (_req: Request, res: Response) => {
  const items = await prisma.siteContent.findMany();
  const map: Record<string, string> = {};
  items.forEach((i) => { map[i.key] = i.value; });
  res.json(map);
});

// ADMIN — update a single key
router.patch('/:key', requireAuth, async (req: Request, res: Response) => {
  const { value } = req.body;
  if (value === undefined) { res.status(400).json({ error: 'Value required' }); return; }
  const item = await prisma.siteContent.upsert({
    where: { key: req.params.key },
    update: { value },
    create: { key: req.params.key, value },
  });
  res.json(item);
});

// ADMIN — bulk update multiple keys
router.patch('/', requireAuth, async (req: Request, res: Response) => {
  const updates: Record<string, string> = req.body;
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.siteContent.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  res.json({ success: true });
});

export default router;
