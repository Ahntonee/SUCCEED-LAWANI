import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth';
import musicRoutes from './routes/music';
import eventsRoutes from './routes/events';
import blogRoutes from './routes/blog';
import contactsRoutes from './routes/contacts';
import contentRoutes from './routes/content';
import subscribersRoutes from './routes/subscribers';
import fashionRoutes from './routes/fashion';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/fashion', fashionRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
