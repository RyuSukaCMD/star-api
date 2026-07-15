// ==========================================
// Utility Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';
import { z } from 'zod';
import { validate } from '../../middlewares/validation';

const router = Router();

router.use(authenticateApiKey);

// QR Code schema
const qrSchema = z.object({
  body: z.object({
    data: z.string().min(1, 'Data is required'),
    size: z.number().optional().default(256),
  }),
});

// Short URL schema
const urlSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL'),
    alias: z.string().optional(),
  }),
});

/**
 * @swagger
 * /utility/qrcode:
 *   post:
 *     tags: [Utility]
 *     summary: Generate QR code
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/qrcode', validate(qrSchema), asyncHandler(async (req: Request, res: Response) => {
  const { data, size } = req.body;
  res.json(successResponse({
    data,
    size,
    qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`,
  }));
}));

/**
 * @swagger
 * /utility/shorten:
 *   post:
 *     tags: [Utility]
 *     summary: Shorten a URL
 */
router.post('/shorten', validate(urlSchema), asyncHandler(async (req: Request, res: Response) => {
  const { url, alias } = req.body;
  const short = alias || Math.random().toString(36).substring(2, 8);
  res.json(successResponse({
    original_url: url,
    short_url: `https://starnova.my.id/s/${short}`,
    alias: short,
  }));
}));

/**
 * @swagger
 * /utility/weather:
 *   get:
 *     tags: [Utility]
 *     summary: Get weather information
 *     security: [{ apiKeyAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema: { type: string }
 */
router.get('/weather', asyncHandler(async (req: Request, res: Response) => {
  const { city } = req.query;
  res.json(successResponse({
    city,
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind_speed: 12,
  }));
}));

export default {
  name: 'utility',
  version: '1.0.0',
  description: 'Utility APIs including QR code generation, URL shortening, and weather',
  enabled: true,
  routes: router,
  prefix: '/utility',
};
