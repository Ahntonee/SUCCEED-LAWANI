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
router.post(
  '/',
  requireAuth,
  upload.any(),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const file = files?.[0];
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

      // ── Local fallback (development only) ──────────────────────────────────
      // WARNING: This stores files on disk — not for production use on Render.
      // Set CLOUDINARY_* env vars to enable persistent cloud storage.
      console.warn('⚠️  Cloudinary not configured. Serving file from memory (dev only).');
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      res.json({ url: dataUrl });

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
