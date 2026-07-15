// ==========================================
// StarNova API - API Key Routes
// ==========================================

import { Router } from 'express';
import {
  createApiKey,
  getApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  toggleApiKey,
  regenerateApiKey,
} from '../controllers/apiKey.controller';
import { authenticateJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createApiKeySchema, updateApiKeySchema, apiKeyParamsSchema } from '../validators/apiKey';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /apikeys:
 *   get:
 *     tags: [API Keys]
 *     summary: Get all API keys for authenticated user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: API Keys retrieved }
 */
router.get('/', getApiKeys);

/**
 * @swagger
 * /apikeys:
 *   post:
 *     tags: [API Keys]
 *     summary: Create a new API key
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: API Key created }
 */
router.post('/', validate(createApiKeySchema), createApiKey);

/**
 * @swagger
 * /apikeys/{id}:
 *   get:
 *     tags: [API Keys]
 *     summary: Get API key by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', validate(apiKeyParamsSchema), getApiKey);

/**
 * @swagger
 * /apikeys/{id}:
 *   put:
 *     tags: [API Keys]
 *     summary: Update API key
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', validate(apiKeyParamsSchema), validate(updateApiKeySchema), updateApiKey);

/**
 * @swagger
 * /apikeys/{id}:
 *   delete:
 *     tags: [API Keys]
 *     summary: Delete API key
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', validate(apiKeyParamsSchema), deleteApiKey);

/**
 * @swagger
 * /apikeys/{id}/toggle:
 *   patch:
 *     tags: [API Keys]
 *     summary: Toggle API key active status
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/toggle', validate(apiKeyParamsSchema), toggleApiKey);

/**
 * @swagger
 * /apikeys/{id}/regenerate:
 *   post:
 *     tags: [API Keys]
 *     summary: Regenerate API key
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/regenerate', validate(apiKeyParamsSchema), regenerateApiKey);

export default router;
