import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import prisma from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const donateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const MIN = 100;
const MAX = 100_000_000;

// ── POST /api/donations/init ─────────────────────────────────────────────────
router.post('/init', donateLimiter, async (req: Request, res: Response) => {
  try {
    const amount   = Math.round(Number(req.body.amount) * 100) / 100;
    const currency = String(req.body.currency || 'NGN').slice(0, 10);
    const name     = String(req.body.name    || '').slice(0, 200).trim();
    const email    = String(req.body.email   || '').toLowerCase().trim();
    const message  = String(req.body.message || '').slice(0, 500).trim();

    if (!amount || isNaN(amount) || amount < MIN || amount > MAX) {
      res.status(400).json({ error: `Enter a valid amount (minimum ₦${MIN}).` });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const reference = 'DON-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    await prisma.donation.create({
      data: { reference, donorName: name, donorEmail: email, message, amount, currency, gateway: 'flutterwave', status: 'pending' },
    });

    const pubKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    if (!pubKey) {
      res.status(503).json({ error: 'Donations are not live yet — please check back soon!', reference, amount, currency });
      return;
    }
    res.json({ reference, publicKey: pubKey, amount, currency });
  } catch (err) {
    console.error('[donations/init]', (err as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/donations/verify/:reference ────────────────────────────────────
router.get('/verify/:reference', async (req: Request, res: Response) => {
  try {
    const reference = String(req.params.reference).slice(0, 120);
    const donation = await prisma.donation.findUnique({ where: { reference } });
    if (!donation) { res.status(404).json({ error: 'Donation not found' }); return; }
    if (donation.status === 'paid') { res.json({ status: 'paid', donation }); return; }

    // If a secret key is configured, verify server-side (authoritative check).
    // Do NOT fall through to "trust client" when the key is present — that
    // would let anyone mark a donation paid by triggering a network error.
    const secret = process.env.FLUTTERWAVE_SECRET_KEY || '';
    if (secret) {
      try {
        const r = await fetch(
          `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
          { headers: { Authorization: `Bearer ${secret}` } }
        );
        const data = await r.json() as { status: string; data?: { status: string; amount: number } };
        if (data.status === 'success' && data.data?.status === 'successful' &&
            Number(data.data.amount) >= Number(donation.amount)) {
          await prisma.donation.update({ where: { reference }, data: { status: 'paid', paidAt: new Date() } });
          res.json({ status: 'paid', donation: { ...donation, status: 'paid' } });
          return;
        }
        // Verification succeeded but payment was not complete
        res.status(402).json({ status: 'pending', error: 'Payment not confirmed by Flutterwave.' });
        return;
      } catch (verifyErr) {
        // Network / parse failure — return pending instead of silently approving
        console.error('[donations/verify] Flutterwave unreachable:', (verifyErr as Error).message);
        res.status(502).json({ status: 'pending', error: 'Could not reach Flutterwave. Please try again.' });
        return;
      }
    }

    // No secret key — trust the client-side Flutterwave popup callback
    await prisma.donation.update({ where: { reference }, data: { status: 'paid', paidAt: new Date() } });
    res.json({ status: 'paid', donation: { ...donation, status: 'paid' } });
  } catch (err) {
    console.error('[donations/verify]', (err as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/donations (admin only) ─────────────────────────────────────────
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const [donations, agg] = await Promise.all([
      prisma.donation.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.donation.aggregate({ where: { status: 'paid' }, _sum: { amount: true }, _count: true }),
    ]);
    res.json({ donations, totalRaised: agg._sum.amount ?? 0, paidCount: agg._count });
  } catch (err) {
    console.error('[donations/list]', (err as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
