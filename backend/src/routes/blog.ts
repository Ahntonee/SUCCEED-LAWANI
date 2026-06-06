import { Router } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseList(raw: string): string[] {
  return raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : [];
}
function serializeList(arr: unknown): string {
  if (Array.isArray(arr)) return arr.join(',');
  if (typeof arr === 'string') return arr;
  return '';
}
function withParsedPost<T extends { tags: string; images: string }>(post: T) {
  return { ...post, tags: parseList(post.tags), images: parseList(post.images) };
}

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.get('/', wrapAsync(async (req, res) => {
  const { category, search } = req.query;
  const where: Record<string, unknown> = { status: 'published' };
  if (category && category !== 'All') where.category = String(category);
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { excerpt: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  const posts = await prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(posts.map(withParsedPost));
}));

router.get('/all', requireAuth, wrapAsync(async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(posts.map(withParsedPost));
}));

router.get('/:id', wrapAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid post ID' }); return; }
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  res.json(withParsedPost(post));
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
  res.status(201).json(withParsedPost(post));
}));

router.patch('/:id', requireAuth, wrapAsync(async (req, res) => {
  const { tags, images, ...rest } = req.body || {};
  const data: Record<string, unknown> = { ...rest };
  if (tags !== undefined) data.tags = serializeList(tags);
  if (images !== undefined) data.images = serializeList(images);
  const post = await prisma.blogPost.update({ where: { id: Number(req.params.id) }, data });
  res.json(withParsedPost(post));
}));

router.delete('/:id', requireAuth, wrapAsync(async (req, res) => {
  await prisma.blogPost.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
}));

export default router;
