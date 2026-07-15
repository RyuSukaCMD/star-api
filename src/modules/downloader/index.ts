// ==========================================
// Downloader Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { successResponse, asyncHandler } from '../../utils/helpers';
import { z } from 'zod';

const router = Router();

router.use(authenticateApiKey);

const downloadSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL'),
  }),
});

/**
 * @swagger
 * /downloader/tiktok:
 *   post:
 *     tags: [Downloader]
 *     summary: Download TikTok video
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/tiktok', validate(downloadSchema), asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  res.json(successResponse({
    title: 'TikTok Video Title',
    url,
    download_url: 'https://example.com/download',
    duration: '00:30',
    quality: 'HD',
  }));
}));

/**
 * @swagger
 * /downloader/youtube:
 *   post:
 *     tags: [Downloader]
 *     summary: Download YouTube video/audio
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/youtube', validate(downloadSchema), asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  res.json(successResponse({
    title: 'YouTube Video Title',
    url,
    formats: [
      { quality: '720p', type: 'video', size: '50MB' },
      { quality: 'MP3', type: 'audio', size: '5MB' },
    ],
  }));
}));

/**
 * @swagger
 * /downloader/instagram:
 *   post:
 *     tags: [Downloader]
 *     summary: Download Instagram content
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/instagram', validate(downloadSchema), asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  res.json(successResponse({
    type: 'post',
    url,
    media: ['https://example.com/media1.jpg'],
  }));
}));

export default {
  name: 'downloader',
  version: '1.0.0',
  description: 'Download media from various platforms',
  enabled: true,
  routes: router,
  prefix: '/downloader',
};
