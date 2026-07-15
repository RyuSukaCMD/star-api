// ==========================================
// AI Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';
import logger from '../../utils/logger';

const router = Router();

// All AI routes require API key
router.use(authenticateApiKey);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI Chat completion
 *     security: [{ apiKeyAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *               model: { type: string }
 */
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  const { message, model } = req.body;

  // Mock AI response - replace with actual AI service
  const response = {
    message: `AI response to: "${message}"`,
    model: model || 'gpt-3.5-turbo',
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  };

  logger.info(`AI Chat request: ${message?.slice(0, 50)}...`);
  res.json(successResponse(response));
}));

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     tags: [AI]
 *     summary: AI Text generation
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { prompt } = req.body;

  const response = {
    text: `Generated text based on: "${prompt}"`,
    model: 'text-davinci-003',
  };

  res.json(successResponse(response));
}));

export default {
  name: 'ai',
  version: '1.0.0',
  description: 'AI-powered endpoints including chat and text generation',
  enabled: true,
  routes: router,
  prefix: '/ai',
};
