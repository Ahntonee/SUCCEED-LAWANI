import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// ─── Startup Validation ───────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
const REQUIRED_IN_PROD = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
if (isProd) {
  const missing = REQUIRED_IN_PROD.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

import authRoutes from './routes/auth';
import musicRoutes from './routes/music';
import eventsRoutes from './routes/events';
import blogRoutes from './routes/blog';
import contactsRoutes from './routes/contacts';
import contentRoutes from './routes/content';
import subscribersRoutes from './routes/subscribers';
import fashionRoutes from './routes/fashion';
import uploadRoutes from './routes/upload';
import shopRoutes from './routes/shop';
import donationsRoutes from './routes/donations';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images/uploads to be served cross-origin
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/fashion', fashionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/donations', donationsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message });
});

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`));
