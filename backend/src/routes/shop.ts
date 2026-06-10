import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { sendOrderConfirmation } from '../services/email';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();

// ─── Rate Limits ─────────────────────────────────────────────────────────────
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many payment requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const customerSchema = z.object({
  customerName: z.string().min(2).max(100).trim(),
  customerEmail: z.string().email().toLowerCase().trim(),
  customerPhone: z.string().max(20).trim().optional().default(''),
});

const cartItemSchema = z.object({
  id: z.number().int().positive(),
  qty: z.number().int().positive().max(100),
});

const paystackVerifySchema = customerSchema.extend({
  reference: z.string().min(1).max(100).trim(),
  items: z.array(cartItemSchema).min(1).max(50),
});

const flutterwaveVerifySchema = customerSchema.extend({
  transactionId: z.string().min(1).trim(),
  items: z.array(cartItemSchema).min(1).max(50),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// Calculate server-side total from DB prices
async function calcServerTotal(items: { id: number; qty: number }[]) {
  const ids = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: 'active' },
    select: { id: true, name: true, price: true, images: true, stock: true },
  });

  let total = 0;
  const enrichedItems: { id: number; name: string; price: number; qty: number; image: string }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) throw new Error(`Product ${item.id} not found or unavailable`);
    if (product.stock < item.qty) throw new Error(`Insufficient stock for "${product.name}"`);
    total += product.price * item.qty;
    enrichedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty,
      image: product.images.split(',')[0]?.trim() || '',
    });
  }

  return { total, enrichedItems };
}

// Fire-and-forget email with admin alert on failure
function sendEmailSafe(data: Parameters<typeof sendOrderConfirmation>[0]) {
  sendOrderConfirmation(data).catch((err) => {
    console.error(`❌ Order #${data.orderId} email failed for ${data.customerEmail}:`, err.message);
    // TODO: hook into a monitoring/alerting service here
  });
}

// ─── PUBLIC: Products ─────────────────────────────────────────────────────────
router.get('/products', wrapAsync(async (req, res) => {
  try {
    const { tag, category, search } = req.query;
    const where: Record<string, unknown> = { status: 'active' };
    if (category) where.category = String(category);
    if (tag) where.tags = { contains: String(tag) };
    if (search) where.name = { contains: String(search), mode: 'insensitive' };
    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(products.map(withParsed));
  } catch {
    res.status(500).json({ error: 'Failed to load products' });
  }
}));

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid product ID' }); return; }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(withParsed(product));
  } catch {
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// ─── ADMIN: Products ──────────────────────────────────────────────────────────
router.post('/products', requireAuth, async (req: Request, res: Response) => {
  try {
    const { images, tags, ...rest } = req.body;
    const product = await prisma.product.create({
      data: { ...rest, images: serializeList(images), tags: serializeList(tags) },
    });
    res.status(201).json(withParsed(product));
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/products/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { images, tags, ...rest } = req.body;
    const data: Record<string, unknown> = { ...rest };
    if (images !== undefined) data.images = serializeList(images);
    if (tags !== undefined) data.tags = serializeList(tags);
    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
    res.json(withParsed(product));
  } catch {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ─── ADMIN: Orders (paginated) ────────────────────────────────────────────────
router.get('/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const skip = Number(req.query.skip) || 0;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip }),
      prisma.order.count(),
    ]);
    res.json({
      orders: orders.map((o) => ({ ...o, items: JSON.parse(o.items) })),
      total,
      limit,
      skip,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.patch('/orders/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    // Only allow updating safe fields (no overwriting items or payment data)
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json({ ...order, items: JSON.parse(order.items) });
  } catch {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ─── PAYMENT: Flutterwave — Verify & Create Order ────────────────────────────
router.post('/verify-flutterwave', paymentLimiter, wrapAsync(async (req, res) => {
  const parsed = flutterwaveVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { transactionId, items, customerName, customerEmail, customerPhone } = parsed.data;

  const flwSecret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!flwSecret) { res.status(503).json({ error: 'Flutterwave is not configured on the server' }); return; }

  // Prevent duplicate orders
  const existing = await prisma.order.findFirst({ where: { paymentRef: String(transactionId) } });
  if (existing) { res.json({ ...existing, items: JSON.parse(existing.items) }); return; }

  // Verify with Flutterwave API server-side (cannot be faked)
  const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${flwSecret}` },
  });
  const verifyData = await verifyRes.json() as {
    status: string;
    data?: { status: string; amount: number; currency: string; customer: { email: string } };
  };

  if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
    res.status(400).json({ error: 'Payment verification failed. Transaction not successful.' });
    return;
  }

  // Calculate total from DB (never trust client prices)
  const { total, enrichedItems } = await calcServerTotal(items);

  // Verify paid amount matches expected total (Flutterwave amount is in NGN directly)
  const paidAmount = verifyData.data?.amount ?? 0;
  if (Math.abs(paidAmount - total) > 1) {
    console.error(`FLW amount mismatch: paid ₦${paidAmount}, expected ₦${total} for txn ${transactionId}`);
    res.status(400).json({ error: 'Payment amount does not match order total.' });
    return;
  }

  const order = await prisma.order.create({
    data: {
      items: JSON.stringify(enrichedItems),
      subtotal: total,
      total,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod: 'flutterwave',
      paymentRef: String(transactionId),
      status: 'paid',
    },
  });

  sendEmailSafe({ orderId: order.id, customerName, customerEmail, items: enrichedItems, total, paymentMethod: 'flutterwave', paymentRef: String(transactionId) });

  res.status(201).json({ ...order, items: enrichedItems });
}));

// ─── PAYMENT: Paystack — Verify & Create Order ───────────────────────────────
router.post('/verify-paystack', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = paystackVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { reference, items, customerName, customerEmail, customerPhone } = parsed.data;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      res.status(503).json({ error: 'Paystack is not configured on the server' });
      return;
    }

    // Prevent duplicate orders for same reference
    const existing = await prisma.order.findFirst({ where: { paymentRef: reference } });
    if (existing) {
      res.json({ ...existing, items: JSON.parse(existing.items) });
      return;
    }

    // Verify with Paystack API (server-side — cannot be faked)
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const verifyData = await verifyRes.json() as { status: boolean; data?: { status: string; amount: number; email: string } };

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      res.status(400).json({ error: 'Payment verification failed. Transaction not successful.' });
      return;
    }

    // Calculate total from DB (never trust client prices)
    const { total, enrichedItems } = await calcServerTotal(items);

    // Verify amount paid matches expected total (Paystack amount is in kobo)
    const paidNaira = (verifyData.data?.amount ?? 0) / 100;
    if (Math.abs(paidNaira - total) > 1) {
      console.error(`Amount mismatch: paid ₦${paidNaira}, expected ₦${total} for ref ${reference}`);
      res.status(400).json({ error: 'Payment amount does not match order total.' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(enrichedItems),
        subtotal: total,
        total,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod: 'paystack',
        paymentRef: reference,
        status: 'paid',
      },
    });

    sendEmailSafe({ orderId: order.id, customerName, customerEmail, items: enrichedItems, total, paymentMethod: 'paystack', paymentRef: reference });

    res.status(201).json({ ...order, items: enrichedItems });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Order creation failed';
    console.error('Paystack verify error:', msg);
    res.status(400).json({ error: msg });
  }
});

export default router;
