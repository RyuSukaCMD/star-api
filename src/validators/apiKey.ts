// ==========================================
// StarNova API - API Key Validators
// ==========================================

import { z } from 'zod';

// Create API Key
export const createApiKeySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    dailyLimit: z.number().int().positive().optional(),
    monthlyLimit: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    whitelistIps: z.array(z.string().ip()).optional().default([]),
    permissions: z.array(z.string()).optional().default([]),
  }),
});

// Update API Key
export const updateApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    dailyLimit: z.number().int().positive().optional(),
    monthlyLimit: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    whitelistIps: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

// API Key Params
export const apiKeyParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'API Key ID is required'),
  }),
});
