import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email required' }); return; }
  const sub = await prisma.subscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email },
  });
  res.status(201).json({ success: true, id: sub.id });
});

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(subs);
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.subscriber.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ success: true });
});

export default router;
