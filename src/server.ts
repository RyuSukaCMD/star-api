// ==========================================
// StarNova API - Main Server Entry Point
// ==========================================

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import config, { validateConfig } from './config';
import DatabaseConnection from './database/connection';
import RedisCache from './database/redis';
import routes from './routes';
import { securityHeaders, sanitize, maintenanceCheck, sanitizeInput } from './middlewares/security';
import { httpLogger, requestId, requestTimer, detailedLogger, ipLogger } from './middlewares/requestLogger';
import { generalLimiter } from './middlewares/rateLimiter';
import { notFound, errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

// Validate configuration
validateConfig();

// Initialize Express app
const app = express();

// ---- Global Middleware ----
app.use(securityHeaders);
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
  methods: config.cors.methods,
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitize);
app.use(sanitizeInput);
app.use(maintenanceCheck);
app.use(generalLimiter);
app.use(ipLogger);
app.use(requestId);
app.use(requestTimer);
app.use(httpLogger);
app.use(detailedLogger);

// ---- Static Files ----
const uploadsDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ---- API Routes ----
app.use(config.apiPrefix, routes);

// ---- Error Handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Server Start (only in non-serverless environments) ----
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!isServerless) {
  const startServer = async (): Promise<void> => {
    try {
      // Connect to MongoDB
      await DatabaseConnection.connect();

      // Connect to Redis (optional - won't crash if unavailable)
      await RedisCache.connect();

      // Start Express server
      app.listen(config.port, config.host, () => {
        console.log(`
╔══════════════════════════════════════════════════════╗
║                    StarNova API                      ║
║           High Performance REST API Platform          ║
╠══════════════════════════════════════════════════════╣
║  Status:     🟢 Running                              ║
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  Port:       ${String(config.port).padEnd(35)}║
║  MongoDB:    ${(DatabaseConnection.getConnectionStatus() ? '🟢 Connected' : '🔴 Disconnected').padEnd(35)}║
║  Redis:      ${(RedisCache.getStatus() ? '🟢 Connected' : '⚫ Disabled').padEnd(35)}║
║  API:        http://${config.host}:${config.port}${config.apiPrefix}        ║
╚══════════════════════════════════════════════════════╝
        `);

        logger.info(`Server started on port ${config.port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`API Base URL: http://${config.host}:${config.port}${config.apiPrefix}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    
    await DatabaseConnection.disconnect();
    await RedisCache.disconnect();
    
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  startServer();
}

// Export for Vercel serverless & testing
export default app;
