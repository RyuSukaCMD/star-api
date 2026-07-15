// ==========================================
// Image Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';

const router = Router();

router.use(authenticateApiKey);

/**
 * @swagger
 * /image/analyze:
 *   post:
 *     tags: [Image]
 *     summary: Analyze image content
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { image_url } = req.body;
  res.json(successResponse({
    image_url,
    analysis: { labels: ['person', 'car', 'tree'], confidence: 0.95 },
  }));
}));

/**
 * @swagger
 * /image/convert:
 *   post:
 *     tags: [Image]
 *     summary: Convert image format
 */
router.post('/convert', asyncHandler(async (req: Request, res: Response) => {
  const { image_url, format = 'png' } = req.body;
  res.json(successResponse({
    original: image_url,
    converted: `https://example.com/converted.${format}`,
    format,
  }));
}));

export default {
  name: 'image',
  version: '1.0.0',
  description: 'Image processing and analysis APIs',
  enabled: true,
  routes: router,
  prefix: '/image',
};
