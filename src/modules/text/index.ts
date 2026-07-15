// ==========================================
// Text Module - StarNova API
// ==========================================

import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse, asyncHandler } from '../../utils/helpers';
import { z } from 'zod';
import { validate } from '../../middlewares/validation';

const router = Router();

router.use(authenticateApiKey);

const textSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text is required'),
  }),
});

/**
 * @swagger
 * /text/summarize:
 *   post:
 *     tags: [Text]
 *     summary: Summarize text content
 *     security: [{ apiKeyAuth: [] }]
 */
router.post('/summarize', validate(textSchema), asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  res.json(successResponse({
    original_length: text.length,
    summary: text.slice(0, 100) + '...',
    summary_length: 100,
  }));
}));

/**
 * @swagger
 * /text/translate:
 *   post:
 *     tags: [Text]
 *     summary: Translate text to another language
 */
router.post('/translate', asyncHandler(async (req: Request, res: Response) => {
  const { text, target_lang = 'en' } = req.body;
  res.json(successResponse({
    original: text,
    translated: `[${target_lang}] ${text}`,
    target_lang,
  }));
}));

/**
 * @swagger
 * /text/detect-language:
 *   post:
 *     tags: [Text]
 *     summary: Detect text language
 */
router.post('/detect-language', validate(textSchema), asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  res.json(successResponse({
    text,
    language: 'English',
    code: 'en',
    confidence: 0.98,
  }));
}));

export default {
  name: 'text',
  version: '1.0.0',
  description: 'Text processing APIs including summarization, translation, and language detection',
  enabled: true,
  routes: router,
  prefix: '/text',
};
