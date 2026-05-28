import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// --- PUBLIC ---
router.get('/tracks', async (_req: Request, res: Response) => {
  const tracks = await prisma.track.findMany({ orderBy: { order: 'asc' } });
  res.json(tracks);
});

router.get('/albums', async (_req: Request, res: Response) => {
  const albums = await prisma.album.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(albums);
});

router.get('/streaming-links', async (_req: Request, res: Response) => {
  const links = await prisma.streamingLink.findMany({ where: { active: true } });
  res.json(links);
});

router.post('/tracks/:id/play', async (req: Request, res: Response) => {
  const track = await prisma.track.update({
    where: { id: Number(req.params.id) },
    data: { playCount: { increment: 1 } },
  });
  res.json({ playCount: track.playCount });
});

router.post('/tracks/:id/download', async (req: Request, res: Response) => {
  const track = await prisma.track.update({
    where: { id: Number(req.params.id) },
    data: { downloadCount: { increment: 1 } },
  });
  res.json({ downloadCount: track.downloadCount });
});

// --- ADMIN ---
router.post('/tracks', requireAuth, async (req: Request, res: Response) => {
  const track = await prisma.track.create({ data: req.body });
  res.status(201).json(track);
});

router.patch('/tracks/:id', requireAuth, async (req: Request, res: Response) => {
  const track = await prisma.track.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(track);
});

router.delete('/tracks/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.track.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.post('/albums', requireAuth, async (req: Request, res: Response) => {
  const album = await prisma.album.create({ data: req.body });
  res.status(201).json(album);
});

router.patch('/albums/:id', requireAuth, async (req: Request, res: Response) => {
  const album = await prisma.album.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(album);
});

router.delete('/albums/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.album.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.patch('/streaming-links/:id', requireAuth, async (req: Request, res: Response) => {
  const link = await prisma.streamingLink.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(link);
});

export default router;
