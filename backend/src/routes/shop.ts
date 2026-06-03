import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import Stripe from 'stripe';

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseList(raw: string): string[] {
  return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
}
function serializeList(arr: unknown): string {
  if (Array.isArray(arr)) return arr.join(',');
  if (typeof arr === 'string') return arr;
  return '';
}
function withParsed<T extends { images: string; tags: string }>(p: T) {
  return { ...p, images: parseList(p.images), tags: parseList(p.tags) };
}

// ─── PUBLIC: Products ────────────────────────────────────────────────────────
router.get('/products', async (req: Request, res: Response) => {
  const { tag, category, search } = req.query;
  const where: Record<string, unknown> = { status: 'active' };
  if (category) where.category = String(category);
  if (tag) where.tags = { contains: String(tag) };
  if (search) where.name = { contains: String(search), mode: 'insensitive' };
  const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(products.map(withParsed));
});

router.get('/products/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
  if (!product) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(withParsed(product));
});

// ─── ADMIN: Products ─────────────────────────────────────────────────────────
router.post('/products', requireAuth, async (req: Request, res: Response) => {
  const { images, tags, ...rest } = req.body;
  const product = await prisma.product.create({
    data: { ...rest, images: serializeList(images), tags: serializeList(tags) },
  });
  res.status(201).json(withParsed(product));
});

router.patch('/products/:id', requireAuth, async (req: Request, res: Response) => {
  const { images, tags, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };
  if (images !== undefined) data.images = serializeList(images);
  if (tags !== undefined) data.tags = serializeList(tags);
  const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
  res.json(withParsed(product));
});

router.delete('/products/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── PUBLIC: Orders ───────────────────────────────────────────────────────────
router.post('/orders', async (req: Request, res: Response) => {
  const { items, subtotal, total, customerName, customerEmail, customerPhone, paymentMethod, paymentRef } = req.body;
  const order = await prisma.order.create({
    data: {
      items: typeof items === 'string' ? items : JSON.stringify(items),
      subtotal: Number(subtotal),
      total: Number(total),
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      paymentMethod,
      paymentRef: paymentRef || '',
      status: paymentRef ? 'paid' : 'pending',
    },
  });
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

// ─── ADMIN: Orders ────────────────────────────────────────────────────────────
router.get('/orders', requireAuth, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(orders.map((o) => ({ ...o, items: JSON.parse(o.items) })));
});

router.patch('/orders/:id', requireAuth, async (req: Request, res: Response) => {
  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json({ ...order, items: JSON.parse(order.items) });
});

// ─── Stripe: Create Payment Intent ───────────────────────────────────────────
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const { amount, currency = 'usd' } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency,
    automatic_payment_methods: { enabled: true },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});

export default router;
