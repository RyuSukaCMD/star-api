// ==========================================
// StarNova API - API Key Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKeyDocument extends Document {
  key: string;
  prefix: string;
  name: string;
  user: mongoose.Types.ObjectId;
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

const apiKeySchema = new Schema<IApiKeyDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prefix: {
      type: String,
      required: true,
      default: 'snv_',
    },
    name: {
      type: String,
      required: [true, 'API Key name is required'],
      trim: true,
      maxlength: 100,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    disabledAt: Date,
    disabledReason: String,
    expiresAt: Date,
    lastUsed: Date,
    usageCount: {
      type: Number,
      default: 0,
    },
    dailyLimit: {
      type: Number,
      default: 100,
    },
    monthlyLimit: {
      type: Number,
      default: 3000,
    },
    dailyUsage: {
      type: Number,
      default: 0,
    },
    monthlyUsage: {
      type: Number,
      default: 0,
    },
    lastDailyReset: {
      type: Date,
      default: Date.now,
    },
    lastMonthlyReset: {
      type: Date,
      default: Date.now,
    },
    whitelistIps: [
      {
        type: String,
      },
    ],
    permissions: [
      {
        type: String,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ user: 1 });
apiKeySchema.index({ isActive: 1, expiresAt: 1 });
apiKeySchema.index({ 'metadata.service': 1 });

const ApiKey = mongoose.model<IApiKeyDocument>('ApiKey', apiKeySchema);

export default ApiKey;
