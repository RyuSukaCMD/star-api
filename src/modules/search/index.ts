// ==========================================
// Search Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';

const router = Router();

router.use(authenticateApiKey);

/**
 * @swagger
 * /search/web:
 *   get:
 *     tags: [Search]
 *     summary: Search the web
 *     security: [{ apiKeyAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 */
router.get('/web', asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '10' } = req.query;

  // Mock search results
  const results = [
    { title: `Result 1 for "${q}"`, url: 'https://example.com/1', snippet: 'This is a search result snippet...' },
    { title: `Result 2 for "${q}"`, url: 'https://example.com/2', snippet: 'Another search result snippet...' },
  ];

  res.json(successResponse({
    query: q,
    total: results.length,
    results,
  }));
}));

/**
 * @swagger
 * /search/images:
 *   get:
 *     tags: [Search]
 *     summary: Search images
 *     security: [{ apiKeyAuth: [] }]
 */
router.get('/images', asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  res.json(successResponse({
    query: q,
    results: [
      { title: 'Image 1', url: 'https://example.com/img1.jpg', width: 800, height: 600 },
    ],
  }));
}));

export default {
  name: 'search',
  version: '1.0.0',
  description: 'Web and image search API endpoints',
  enabled: true,
  routes: router,
  prefix: '/search',
};
