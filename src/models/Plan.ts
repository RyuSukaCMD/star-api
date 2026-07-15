// ==========================================
// StarNova API - Plan Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanDocument extends Document {
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
  color: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlanDocument>(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Plan description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    duration: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    features: [
      {
        type: String,
      },
    ],
    dailyLimit: {
      type: Number,
      default: 100,
    },
    monthlyLimit: {
      type: Number,
      default: 3000,
    },
    rateLimit: {
      type: Number,
      default: 10,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

planSchema.index({ slug: 1 });
planSchema.index({ isActive: 1, priority: -1 });

const Plan = mongoose.model<IPlanDocument>('Plan', planSchema);

export default Plan;
