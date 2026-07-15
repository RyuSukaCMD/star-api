// ==========================================
// StarNova API - User Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
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
  apiKeys: mongoose.Types.ObjectId[];
  settings: {
    theme: 'dark' | 'light';
    emailNotifications: boolean;
    twoFactorEnabled: boolean;
    webhookUrl?: string;
  };
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'owner'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedAt: Date,
    banReason: String,
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      default: 'free',
    },
    apiKeys: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ApiKey',
      },
    ],
    settings: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: null },
    },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    verificationToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.verificationToken;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
