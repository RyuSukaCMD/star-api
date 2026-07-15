// ==========================================
// StarNova API - Admin Routes
// ==========================================

import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserDetail,
  banUser,
  unbanUser,
  getApiKeys,
  getAnalytics,
  getSettings,
  updateSetting,
  setMaintenance,
  getLogs,
} from '../controllers/admin.controller';
import { authenticateJWT, adminOnly } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateJWT);
router.use(adminOnly);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user detail
 */
router.get('/users/:id', getUserDetail);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   post:
 *     tags: [Admin]
 *     summary: Ban a user
 */
router.post('/users/:id/ban', banUser);

/**
 * @swagger
 * /admin/users/{id}/unban:
 *   post:
 *     tags: [Admin]
 *     summary: Unban a user
 */
router.post('/users/:id/unban', unbanUser);

/**
 * @swagger
 * /admin/apikeys:
 *   get:
 *     tags: [Admin]
 *     summary: Get all API keys
 */
router.get('/apikeys', getApiKeys);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get analytics data
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get system settings
 */
router.get('/settings', getSettings);

/**
 * @swagger
 * /admin/settings:
 *   post:
 *     tags: [Admin]
 *     summary: Update system setting
 */
router.post('/settings', updateSetting);

/**
 * @swagger
 * /admin/maintenance:
 *   post:
 *     tags: [Admin]
 *     summary: Toggle maintenance mode
 */
router.post('/maintenance', setMaintenance);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get system logs
 */
router.get('/logs', getLogs);

export default router;
