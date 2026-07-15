// ==========================================
// StarNova API - Auth Service
// ==========================================

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import config from '../config';
import { ApiError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { auditLog } from '../utils/logger';

class AuthService {
  // Generate JWT Token
  generateToken(userId: string, role: string): string {
    return jwt.sign({ id: userId, role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  // Generate Refresh Token
  generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  // Verify Refresh Token
  verifyRefreshToken(token: string): { id: string } {
    return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
  }

  // Register new user
  async register(data: {
    email: string;
    username: string;
    password: string;
    name: string;
  }): Promise<{ user: any; token: string; refreshToken: string }> {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new ApiError(409, 'Email already registered');
      }
      throw new ApiError(409, 'Username already taken');
    }

    const user = await User.create(data);

    const token = this.generateToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    auditLog('USER_REGISTER', user._id.toString(), { email: user.email }, '');

    return {
      user: user.toJSON(),
      token,
      refreshToken,
    };
  }

  // Login
  async login(
    identifier: string,
    password: string,
    ip?: string,
  ): Promise<{ user: any; token: string; refreshToken: string }> {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.isBanned) {
      throw new ApiError(403, 'Account has been banned');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is inactive');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = this.generateToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Update user
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.refreshToken = refreshToken;
    await user.save();

    auditLog('USER_LOGIN', user._id.toString(), { ip: ip || 'unknown' }, ip);

    return {
      user: user.toJSON(),
      token,
      refreshToken,
    };
  }

  // Refresh token
  async refreshToken(token: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = this.verifyRefreshToken(token);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      if (!user.isActive || user.isBanned) {
        throw new ApiError(403, 'Account is not active');
      }

      const newToken = this.generateToken(user._id.toString(), user.role);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      user.refreshToken = newRefreshToken;
      await user.save();

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return 'If the email exists, a reset link has been sent';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production, send email with reset link
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    return 'If the email exists, a reset link has been sent';
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    auditLog('PASSWORD_RESET', user._id.toString(), {}, '');
  }

  // Get current user profile
  async getProfile(userId: string): Promise<any> {
    const user = await User.findById(userId).populate('apiKeys');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
}

export default new AuthService();
