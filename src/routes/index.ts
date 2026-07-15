// ==========================================
// StarNova API - Routes Index
// ==========================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import apiKeyRoutes from './apiKey.routes';
import adminRoutes from './admin.routes';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

// Health check
router.get('/health', healthCheck);

// API Routes
router.use('/auth', authRoutes);
router.use('/apikeys', apiKeyRoutes);
router.use('/admin', adminRoutes);

export default router;
