// ==========================================
// StarNova API - Database Seeder
// ==========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config';
import User from '../models/User';
import Plan from '../models/Plan';
import Settings from '../models/Settings';
import Analytics from '../models/Analytics';
import logger from '../utils/logger';

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB for seeding');

    // ---- Seed Admin User ----
    const adminExists = await User.findOne({ role: 'owner' });
    if (!adminExists) {
      const admin = await User.create({
        email: config.admin.email,
        username: config.admin.username,
        password: config.admin.password,
        name: 'StarNova Admin',
        role: 'owner',
        isVerified: true,
        isActive: true,
        plan: 'enterprise',
      });
      logger.info(`Admin user created: ${admin.email}`);
    } else {
      logger.info('Admin user already exists');
    }

    // ---- Seed Plans ----
    const plans = [
      {
        name: 'Free',
        slug: 'free',
        description: 'Perfect for getting started with StarNova API',
        price: 0,
        currency: 'IDR',
        duration: 'monthly' as const,
        features: [
          '100 requests/day',
          '3,000 requests/month',
          '3 API Keys',
          'Basic endpoints',
          'Community support',
          'Standard rate limit',
        ],
        dailyLimit: 100,
        monthlyLimit: 3000,
        rateLimit: 10,
        priority: 0,
        isActive: true,
        isPopular: false,
        color: '#6b7280',
      },
      {
        name: 'Basic',
        slug: 'basic',
        description: 'Great for small projects and personal use',
        price: 50000,
        currency: 'IDR',
        duration: 'monthly' as const,
        features: [
          '1,000 requests/day',
          '30,000 requests/month',
          '10 API Keys',
          'All endpoints',
          'Email support',
          'Higher rate limit',
          'Basic analytics',
        ],
        dailyLimit: 1000,
        monthlyLimit: 30000,
        rateLimit: 30,
        priority: 1,
        isActive: true,
        isPopular: false,
        color: '#3b82f6',
      },
      {
        name: 'Premium',
        slug: 'premium',
        description: 'For professional applications and teams',
        price: 150000,
        currency: 'IDR',
        duration: 'monthly' as const,
        features: [
          '10,000 requests/day',
          '300,000 requests/month',
          '50 API Keys',
          'All endpoints + premium',
          'Priority support',
          'High rate limit',
          'Advanced analytics',
          'IP whitelisting',
          'API playground',
        ],
        dailyLimit: 10000,
        monthlyLimit: 300000,
        rateLimit: 100,
        priority: 2,
        isActive: true,
        isPopular: true,
        color: '#8b5cf6',
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For large-scale applications and businesses',
        price: 500000,
        currency: 'IDR',
        duration: 'monthly' as const,
        features: [
          '100,000 requests/day',
          '3,000,000 requests/month',
          'Unlimited API Keys',
          'All features',
          '24/7 priority support',
          'Unlimited rate limit',
          'Custom analytics',
          'SLA guarantee',
          'Dedicated infrastructure',
          'Custom integration',
        ],
        dailyLimit: 100000,
        monthlyLimit: 3000000,
        rateLimit: 1000,
        priority: 3,
        isActive: true,
        isPopular: false,
        color: '#f59e0b',
      },
    ];

    for (const planData of plans) {
      const existing = await Plan.findOne({ slug: planData.slug });
      if (!existing) {
        await Plan.create(planData);
        logger.info(`Plan created: ${planData.name}`);
      } else {
        logger.info(`Plan already exists: ${planData.name}`);
      }
    }

    // ---- Seed Settings ----
    const defaultSettings = [
      { key: 'maintenance_mode', value: false, type: 'boolean', group: 'system', description: 'Enable maintenance mode' },
      { key: 'maintenance_message', value: 'System is under maintenance. Please try again later.', type: 'string', group: 'system', description: 'Maintenance mode message' },
      { key: 'allow_registration', value: true, type: 'boolean', group: 'auth', description: 'Allow new user registration' },
      { key: 'site_name', value: 'StarNova API', type: 'string', group: 'general', description: 'Site name' },
      { key: 'site_description', value: 'High Performance REST API Platform', type: 'string', group: 'general', description: 'Site description' },
      { key: 'default_locale', value: 'en', type: 'string', group: 'general', description: 'Default language' },
    ];

    for (const setting of defaultSettings) {
      const existing = await Settings.findOne({ key: setting.key });
      if (!existing) {
        await Settings.create(setting);
        logger.info(`Setting created: ${setting.key}`);
      }
    }

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
