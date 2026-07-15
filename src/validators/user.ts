// ==========================================
// StarNova API - User Validators
// ==========================================

import { z } from 'zod';

// Update Profile
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().url().optional().nullable(),
    settings: z.object({
      theme: z.enum(['dark', 'light']).optional(),
      emailNotifications: z.boolean().optional(),
      webhookUrl: z.string().url().optional().nullable(),
    }).optional(),
  }),
});

// Change Password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number',
      ),
  }),
});
