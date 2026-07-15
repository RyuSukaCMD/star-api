// ==========================================
// Brat Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';

const router = Router();

router.use(authenticateApiKey);

/**
 * @swagger
 * /brat/generate:
 *   post:
 *     tags: [Brat]
 *     summary: Generate Brat-style text/image
 *     security: [{ apiKeyAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string }
 *               style: { type: string, enum: [classic, neon, dark] }
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { text, style = 'classic' } = req.body;

  res.json(successResponse({
    text,
    style,
    result: `https://example.com/brat/${encodeURIComponent(text)}`,
    variants: [
      { style: 'classic', url: `https://example.com/brat/classic/${encodeURIComponent(text)}` },
      { style: 'neon', url: `https://example.com/brat/neon/${encodeURIComponent(text)}` },
    ],
  }));
}));

export default {
  name: 'brat',
  version: '1.0.0',
  description: 'Brat-style text and image generation',
  enabled: true,
  routes: router,
  prefix: '/brat',
};
