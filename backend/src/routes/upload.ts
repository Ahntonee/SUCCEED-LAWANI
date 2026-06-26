import fs from 'fs';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Multer (memory storage — no disk writes) ─────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  },
});

// ─── Upload Route ─────────────────────────────────────────────────────────────
// Accept at most one file under the 'image' OR 'audio' field name.
// upload.any() was replaced to prevent clients from flooding memory with
// many file fields (each up to 50 MB) in a single request.
router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const fieldMap = req.files as Record<string, Express.Multer.File[]> | undefined;
      const file = fieldMap?.image?.[0] ?? fieldMap?.audio?.[0];
      if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }

      // ── Cloudinary upload (production) ─────────────────────────────────────
      if (cloudinaryConfigured) {
        const resourceType = file.mimetype.startsWith('audio/') ? 'video' : 'image';
        const folder = 'succeed-lawani';

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder },
            (error, result) => {
              if (error || !result) reject(error || new Error('Cloudinary upload failed'));
              else resolve(result as { secure_url: string });
            }
          ).end(file.buffer);
        });

        res.json({ url: result.secure_url });
        return;
      }

      // ── Local disk fallback ────────────────────────────────────────────────
      // Saves to backend/uploads/ and returns a /api/uploads/<file> URL.
      // nginx already proxies /api/* to this server, so the URL is publicly
      // reachable without any extra nginx config. Set CLOUDINARY_* env vars
      // for proper cloud storage; this fallback works but files are local-only.
      console.warn('⚠️  Cloudinary not configured. Saving to local disk (/api/uploads/).');
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.mp3' : '.jpg');
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      res.json({ url: `/api/uploads/${filename}` });

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', msg);
      res.status(500).json({ error: msg });
    }
  }
);

// ─── Multer error handler ─────────────────────────────────────────────────────
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ error: err.message });
});

export default router;
