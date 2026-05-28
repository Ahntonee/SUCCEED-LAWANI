import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Comma-separated string helpers for tags and images
function parseTags(raw: string): string[] {
  return raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : [];
}
function serializeTags(tags: unknown): string {
  if (Array.isArray(tags)) return tags.join(',');
  if (typeof tags === 'string') return tags;
  return '';
}
function parseImages(raw: string): string[] {
  return raw ? raw.split(',').map((u) => u.trim()).filter(Boolean) : [];
}
function serializeImages(images: unknown): string {
  if (Array.isArray(images)) return images.join(',');
  if (typeof images === 'string') return images;
  return '';
}
function withParsedPost<T extends { tags: string; images: string }>(post: T): Omit<T, 'tags' | 'images'> & { tags: string[]; images: string[] } {
  return { ...post, tags: parseTags(post.tags), images: parseImages(post.images) };
}
// Keep backward compat alias
const withParsedTags = withParsedPost;

// --- PUBLIC ---
router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const where: Record<string, unknown> = { status: 'published' };
  if (category && category !== 'All') where.category = String(category);
  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { excerpt: { contains: String(search) } },
    ];
  }
  const posts = await prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(posts.map(withParsedTags));
});

router.get('/all', requireAuth, async (_req: Request, res: Response) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(posts.map(withParsedTags));
});

router.get('/:id', async (req: Request, res: Response) => {
  const post = await prisma.blogPost.findUnique({ where: { id: Number(req.params.id) } });
  if (!post) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(withParsedTags(post));
});

router.post('/:id/view', async (req: Request, res: Response) => {
  const post = await prisma.blogPost.update({
    where: { id: Number(req.params.id) },
    data: { viewCount: { increment: 1 } },
  });
  res.json({ viewCount: post.viewCount });
});

// --- ADMIN ---
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { tags, images, ...rest } = req.body;
  const post = await prisma.blogPost.create({ data: { ...rest, tags: serializeTags(tags), images: serializeImages(images) } });
  res.status(201).json(withParsedPost(post));
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const { tags, images, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };
  if (tags !== undefined) data.tags = serializeTags(tags);
  if (images !== undefined) data.images = serializeImages(images);
  const post = await prisma.blogPost.update({ where: { id: Number(req.params.id) }, data });
  res.json(withParsedPost(post));
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.blogPost.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
