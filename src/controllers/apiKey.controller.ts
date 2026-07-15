// ==========================================
// StarNova API - API Key Controller
// ==========================================

import { Response, NextFunction } from 'express';
import apiKeyService from '../services/apiKey.service';
import { AuthenticatedRequest } from '../types';
import { successResponse, getPaginationMeta, getPaginationParams } from '../utils/helpers';
import { asyncHandler } from '../utils/helpers';

export const createApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const apiKey = await apiKeyService.create(userId, req.body);
    res.status(201).json(successResponse(apiKey, 'API Key created'));
  },
);

export const getApiKeys = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { page, limit } = getPaginationParams(req.query as any);
    const { keys, total } = await apiKeyService.getAll(userId, page, limit);
    res.status(200).json(
      successResponse(keys, 'API Keys retrieved', getPaginationMeta(total, page, limit)),
    );
  },
);

export const getApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const apiKey = await apiKeyService.getById(id, userId);
    res.status(200).json(successResponse(apiKey));
  },
);

export const updateApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const apiKey = await apiKeyService.update(id, userId, req.body);
    res.status(200).json(successResponse(apiKey, 'API Key updated'));
  },
);

export const deleteApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    await apiKeyService.delete(id, userId);
    res.status(200).json(successResponse(null, 'API Key deleted'));
  },
);

export const toggleApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const apiKey = await apiKeyService.toggle(id, userId);
    const status = apiKey.isActive ? 'enabled' : 'disabled';
    res.status(200).json(successResponse(apiKey, `API Key ${status}`));
  },
);

export const regenerateApiKey = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const apiKey = await apiKeyService.regenerate(id, userId);
    res.status(200).json(successResponse(apiKey, 'API Key regenerated'));
  },
);
