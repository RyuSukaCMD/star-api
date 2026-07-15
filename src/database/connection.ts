// ==========================================
// StarNova API - Database Connection
// ==========================================

import mongoose from 'mongoose';
import config from '../config';
import logger from '../utils/logger';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Already connected to MongoDB');
      return;
    }

    try {
      const uri = config.mongodb.uri;
      const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        w: 'majority' as const,
      };

      await mongoose.connect(uri, options);

      this.isConnected = true;
      logger.info('Connected to MongoDB successfully');

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async healthCheck(): Promise<{
    status: string;
    responseTime: number;
    connections: number;
  }> {
    const start = Date.now();
    try {
      if (mongoose.connection.readyState !== 1) {
        return { status: 'disconnected', responseTime: Date.now() - start, connections: 0 };
      }
      const db = mongoose.connection.db;
      if (!db) {
        return { status: 'disconnected', responseTime: Date.now() - start, connections: 0 };
      }
      await db.admin().ping();
      const connCount = mongoose.connection.readyState === 1 ? 1 : 0;
      return {
        status: 'healthy',
        responseTime: Date.now() - start,
        connections: connCount,
      };
    } catch (error) {
      return { status: 'unhealthy', responseTime: Date.now() - start, connections: 0 };
    }
  }
}

export default DatabaseConnection.getInstance();
