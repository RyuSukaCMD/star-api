// ==========================================
// StarNova API - Analytics Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface ITopEndpoint {
  endpoint: string;
  method: string;
  count: number;
}

export interface IAnalyticsDocument extends Document {
  date: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  activeUsers: number;
  totalApiKeys: number;
  averageResponseTime: number;
  topEndpoints: ITopEndpoint[];
  errorsByType: Record<string, number>;
  requestsByHour: number[];
  requestsByEndpoint: Record<string, number>;
  bandwidth: number;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalyticsDocument>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    successfulRequests: {
      type: Number,
      default: 0,
    },
    failedRequests: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    totalApiKeys: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    topEndpoints: [
      {
        endpoint: String,
        method: String,
        count: Number,
      },
    ],
    errorsByType: {
      type: Schema.Types.Mixed,
      default: {},
    },
    requestsByHour: {
      type: [Number],
      default: Array(24).fill(0),
    },
    requestsByEndpoint: {
      type: Schema.Types.Mixed,
      default: {},
    },
    bandwidth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Analytics = mongoose.model<IAnalyticsDocument>('Analytics', analyticsSchema);

export default Analytics;
