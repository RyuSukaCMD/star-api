// ==========================================
// StarNova API - Central Configuration
// ==========================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  host: string;
  apiPrefix: string;
  domain: {
    api: string;
    dashboard: string;
    main: string;
  };

  mongodb: {
    uri: string;
    uriTest: string;
  };

  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };

  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  encryption: {
    aesSecret: string;
    aesIv: string;
  };

  apiKey: {
    prefix: string;
    length: number;
    defaultDailyLimit: number;
    defaultMonthlyLimit: number;
  };

  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };

  cors: {
    origin: string;
    methods: string;
  };

  logging: {
    level: string;
    dir: string;
  };

  upload: {
    dir: string;
    maxFileSize: number;
  };

  swagger: {
    title: string;
    description: string;
    version: string;
    server: string;
  };

  cache: {
    ttl: number;
  };

  payment: {
    midtransServerKey: string;
    midtransClientKey: string;
    midtransIsProduction: boolean;
    xenditApiKey: string;
    xenditIsProduction: boolean;
  };

  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    from: string;
  };

  webhook: {
    secret: string;
  };

  admin: {
    email: string;
    username: string;
    password: string;
  };

  whatsapp: {
    botToken: string;
    enabled: boolean;
    ownerNumber: string;
  };

  verification: {
    required: boolean;
  };

  maintenance: {
    mode: boolean;
    message: string;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  domain: {
    api: process.env.DOMAIN_API || 'https://api.starnova.my.id',
    dashboard: process.env.DOMAIN_DASHBOARD || 'https://dash.starnova.my.id',
    main: process.env.DOMAIN_MAIN || 'https://starnova.my.id',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/starnova',
    uriTest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/starnova_test',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  encryption: {
    aesSecret: process.env.AES_SECRET || 'default-aes-secret-32-chars!!',
    aesIv: process.env.AES_IV || 'default-16-char',
  },

  apiKey: {
    prefix: process.env.API_KEY_PREFIX || 'snv_',
    length: parseInt(process.env.API_KEY_LENGTH || '32', 10),
    defaultDailyLimit: parseInt(process.env.API_KEY_DEFAULT_DAILY_LIMIT || '100', 10),
    defaultMonthlyLimit: parseInt(process.env.API_KEY_DEFAULT_MONTHLY_LIMIT || '3000', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later.',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },

  swagger: {
    title: process.env.SWAGGER_TITLE || 'StarNova API',
    description: process.env.SWAGGER_DESCRIPTION || 'High Performance REST API Platform',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    server: process.env.SWAGGER_SERVER || 'http://localhost:5000',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  },

  payment: {
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY || '',
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    xenditApiKey: process.env.XENDIT_API_KEY || '',
    xenditIsProduction: process.env.XENDIT_IS_PRODUCTION === 'true',
  },

  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@starnova.my.id',
  },

  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'default-webhook-secret',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@starnova.my.id',
    username: process.env.ADMIN_USERNAME || 'starnova',
    password: process.env.ADMIN_PASSWORD || 'SuperSecurePassword123!',
  },

  whatsapp: {
    botToken: process.env.WHATSAPP_BOT_TOKEN || '',
    enabled: process.env.WHATSAPP_BOT_ENABLED === 'true',
    ownerNumber: process.env.WHATSAPP_OWNER_NUMBER || '',
  },

  verification: {
    required: process.env.VERIFICATION_REQUIRED === 'true',
  },

  maintenance: {
    mode: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please try again later.',
  },
};

// Validate critical config
export const validateConfig = (): void => {
  const criticalVars: string[] = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = criticalVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`⚠ Warning: Missing critical environment variables: ${missing.join(', ')}`);
    console.warn('⚠ Using default values may cause security issues in production.');
  }
};

export default config;
