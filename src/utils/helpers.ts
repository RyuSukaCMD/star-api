// ==========================================
// StarNova API - Utility Helpers
// ==========================================

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, PaginationMeta } from '../types';

// ---- Response Helpers ----
export const successResponse = <T>(
  data: T,
  message = 'Success',
  meta?: PaginationMeta,
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (
  message: string,
  error: string,
  statusCode: number,
): ApiResponse<null> => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString(),
});

// ---- Pagination ----
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

export const getPaginationParams = (query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ---- API Key Generation ----
export const generateApiKey = (prefix: string, length: number): string => {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const randomString = randomBytes.toString('hex').slice(0, length);
  return `${prefix}${randomString}`;
};

// ---- Token Generation ----
export const generateToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// ---- ID Generation ----
export const generateId = (): string => {
  return uuidv4();
};

// ---- Slug Generation ----
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

// ---- Date Helpers ----
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isExpired = (date: Date): boolean => {
  return new Date() > date;
};

export const formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// ---- String Helpers ----
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const maskString = (str: string, visible = 4): string => {
  if (str.length <= visible) return str;
  return str.slice(0, visible) + '*'.repeat(str.length - visible);
};

// ---- Encryption Helpers ----
import CryptoJS from 'crypto-js';

export const encrypt = (text: string, secret: string): string => {
  return CryptoJS.AES.encrypt(text, secret).toString();
};

export const decrypt = (ciphertext: string, secret: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ---- Object Helpers ----
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

// ---- Async Handler ----
export const asyncHandler = (
  fn: (req: any, res: any, next: any) => Promise<any>,
) => {
  return (req: any, res: any, next: any): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ---- Retry Logic ----
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
};

// ---- Parse User Agent ----
export const parseUserAgent = (ua: string) => {
  const UAParser = require('ua-parser-js');
  const parser = new UAParser(ua);
  return {
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
  };
};

// ---- Sleep ----
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
