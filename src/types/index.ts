// ==========================================
// StarNova API - Type Definitions
// ==========================================

import { Request } from 'express';

// ---- API Response Types ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// ---- User Types ----
export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'owner';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: Date;
  banReason?: string;
  lastLogin?: Date;
  loginCount: number;
  plan: string;
  apiKeys: string[];
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  webhookUrl?: string;
}

// ---- API Key Types ----
export interface IApiKey {
  _id: string;
  key: string;
  prefix: string;
  name: string;
  user: string;
  plan: string;
  isActive: boolean;
  isDisabled: boolean;
  disabledAt?: Date;
  disabledReason?: string;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsage: number;
  monthlyUsage: number;
  lastDailyReset: Date;
  lastMonthlyReset: Date;
  whitelistIps: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Payment Types ----
export interface IPayment {
  _id: string;
  user: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: string;
  duration: 'monthly' | 'yearly';
  status: 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
  paymentMethod: string;
  paymentChannel: string;
  transactionId?: string;
  paidAt?: Date;
  expiredAt: Date;
  metadata: Record<string, unknown>;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Plan Types ----
export interface IPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  dailyLimit: number;
  monthlyLimit: number;
  rateLimit: number;
  priority: number;
  isActive: boolean;
  isPopular: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Analytics Types ----
export interface IAnalytics {
  _id: string;
  date: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  activeUsers: number;
  totalApiKeys: number;
  averageResponseTime: number;
  topEndpoints: TopEndpoint[];
  errorsByType: Record<string, number>;
  requestsByHour: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TopEndpoint {
  endpoint: string;
  method: string;
  count: number;
}

// ---- Request Log Types ----
export interface IRequestLog {
  _id: string;
  apiKey?: string;
  user?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  country?: string;
  userAgent?: string;
  referer?: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  responseSize: number;
  cached: boolean;
  error?: string;
  timestamp: Date;
  createdAt: Date;
}

// ---- Middleware Types ----
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  apiKey?: IApiKey;
  requestId?: string;
  startTime?: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// ---- Module Types ----
export interface ApiModule {
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  routes: import('express').Router;
  prefix: string;
}

// ---- WebSocket Types ----
export interface WebSocketEvent {
  event: string;
  data: unknown;
  room?: string;
}

// ---- WhatsApp Bot Types ----
export interface WhatsAppCommand {
  command: string;
  description: string;
  permission: 'owner' | 'admin' | 'user';
  handler: (args: string[], sender: string) => Promise<string>;
}

// ---- Cache Types ----
export interface CacheOptions {
  ttl?: number;
  key?: string;
}
