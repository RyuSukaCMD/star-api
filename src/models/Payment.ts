// ==========================================
// StarNova API - Payment Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  user: mongoose.Types.ObjectId;
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

const paymentSchema = new Schema<IPaymentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    plan: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'expired', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    paymentChannel: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
    },
    paidAt: Date,
    expiredAt: {
      type: Date,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    invoiceUrl: String,
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);

export default Payment;
