// ==========================================
// StarNova API - Request Log Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IRequestLogDocument extends Document {
  apiKey?: string;
  user?: mongoose.Types.ObjectId;
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

const requestLogSchema = new Schema<IRequestLogDocument>(
  {
    apiKey: {
      type: String,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    country: String,
    userAgent: String,
    referer: String,
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    query: {
      type: Schema.Types.Mixed,
      default: {},
    },
    body: {
      type: Schema.Types.Mixed,
      default: {},
    },
    responseSize: {
      type: Number,
      default: 0,
    },
    cached: {
      type: Boolean,
      default: false,
    },
    error: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient querying
requestLogSchema.index({ apiKey: 1, timestamp: -1 });
requestLogSchema.index({ user: 1, timestamp: -1 });
requestLogSchema.index({ endpoint: 1, timestamp: -1 });
requestLogSchema.index({ statusCode: 1 });
requestLogSchema.index({ timestamp: -1 });
requestLogSchema.index({ ip: 1, timestamp: -1 });

// TTL index to auto-delete logs after 90 days
requestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const RequestLog = mongoose.model<IRequestLogDocument>('RequestLog', requestLogSchema);

export default RequestLog;
