import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/tracks', wrapAsync(async (_req, res) => {
  const tracks = await prisma.track.findMany({ orderBy: { order: 'asc' } });
  res.json(tracks);
}));

router.get('/albums', wrapAsync(async (_req, res) => {
  const albums = await prisma.album.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(albums);
}));

router.get('/streaming-links', wrapAsync(async (_req, res) => {
  const links = await prisma.streamingLink.findMany({ where: { active: true } });
  res.json(links);
}));

router.post('/tracks/:id/play', wrapAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid track ID' }); return; }
  const track = await prisma.track.update({ where: { id }, data: { playCount: { increment: 1 } } });
  res.json({ playCount: track.playCount });
}));

router.post('/tracks/:id/download', wrapAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid track ID' }); return; }
  const track = await prisma.track.update({ where: { id }, data: { downloadCount: { increment: 1 } } });
  res.json({ downloadCount: track.downloadCount });
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
// Allowlist writable Track fields — prevents mass-assignment of id, playCount, etc.
const TRACK_FIELDS = ['title', 'album', 'duration', 'cover', 'audioUrl', 'featured', 'order'] as const;
function pickTrackFields(body: Record<string, unknown>) {
  return Object.fromEntries(TRACK_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));
}

const ALBUM_FIELDS = ['title', 'year', 'type', 'cover', 'trackCount', 'description'] as const;
function pickAlbumFields(body: Record<string, unknown>) {
  return Object.fromEntries(ALBUM_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));
}

router.post('/tracks', requireAuth, wrapAsync(async (req, res) => {
  const track = await prisma.track.create({ data: pickTrackFields(req.body) as Parameters<typeof prisma.track.create>[0]['data'] });
  res.status(201).json(track);
}));

router.patch('/tracks/:id', requireAuth, wrapAsync(async (req, res) => {
  const track = await prisma.track.update({ where: { id: Number(req.params.id) }, data: pickTrackFields(req.body) });
  res.json(track);
}));

router.delete('/tracks/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.track.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

router.post('/albums', requireAuth, wrapAsync(async (req, res) => {
  const album = await prisma.album.create({ data: pickAlbumFields(req.body) as Parameters<typeof prisma.album.create>[0]['data'] });
  res.status(201).json(album);
}));

router.patch('/albums/:id', requireAuth, wrapAsync(async (req, res) => {
  const album = await prisma.album.update({ where: { id: Number(req.params.id) }, data: pickAlbumFields(req.body) });
  res.json(album);
}));

router.delete('/albums/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.album.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

router.patch('/streaming-links/:id', requireAuth, wrapAsync(async (req, res) => {
  const { url, active } = req.body;
  const link = await prisma.streamingLink.update({ where: { id: Number(req.params.id) }, data: { url, active } });
  res.json(link);
}));

export default router;
