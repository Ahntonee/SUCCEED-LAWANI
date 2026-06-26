import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';
import { parseList, serializeList, withParsedLists } from '../utils/listHelpers';

const router = Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.get('/', wrapAsync(async (req, res) => {
  const { category, search, limit, skip } = req.query;
  const take = limit ? Math.min(Number(limit), 100) : undefined;
  const where: Record<string, unknown> = { status: 'published' };
  if (category && category !== 'All') where.category = String(category);
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { excerpt: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    ...(take !== undefined && { take }),
    ...(skip  !== undefined && { skip: Number(skip) }),
  });
  res.json(posts.map(withParsedLists));
}));

router.get('/all', requireAuth, wrapAsync(async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(posts.map(withParsedLists));
}));

router.get('/:id', wrapAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid post ID' }); return; }
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  res.json(withParsedLists(post));
}));

router.post('/:id/view', wrapAsync(async (req, res) => {
  const post = await prisma.blogPost.update({
    where: { id: Number(req.params.id) },
    data: { viewCount: { increment: 1 } },
  });
  res.json({ viewCount: post.viewCount });
}));

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, wrapAsync(async (req, res) => {
  const { tags, images, ...rest } = req.body || {};
  const post = await prisma.blogPost.create({
    data: { ...rest, tags: serializeList(tags), images: serializeList(images) },
  });
  res.status(201).json(withParsedLists(post));
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const { tags, images, ...rest } = req.body || {};
  const data: Record<string, unknown> = { ...rest };
  if (tags !== undefined) data.tags = serializeList(tags);
  if (images !== undefined) data.images = serializeList(images);
  const post = await prisma.blogPost.update({ where: { id: Number(req.params.id) }, data });
  res.json(withParsedLists(post));
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.blogPost.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

export default router;
