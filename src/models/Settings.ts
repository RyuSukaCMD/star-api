// ==========================================
// StarNova API - Settings Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsDocument extends Document {
  key: string;
  value: unknown;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  group: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },
    group: {
      type: String,
      default: 'general',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Settings = mongoose.model<ISettingsDocument>('Settings', settingsSchema);

export default Settings;
