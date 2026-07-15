// ==========================================
// StarNova API - Auth Controller
// ==========================================

import { Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { successResponse } from '../utils/helpers';
import { asyncHandler } from '../utils/helpers';

export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { email, username, password, name } = req.body;
    const result = await authService.register({ email, username, password, name });
    res.status(201).json(successResponse(result, 'Registration successful'));
  },
);

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const identifier = req.body.email || req.body.username;
    const { password } = req.body;
    const ip = req.ip;
    const result = await authService.login(identifier, password, ip);
    res.status(200).json(successResponse(result, 'Login successful'));
  },
);

export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshToken(token);
    res.status(200).json(successResponse(result, 'Token refreshed'));
  },
);

export const forgotPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(successResponse({ message: result }));
  },
);

export const resetPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json(successResponse(null, 'Password reset successful'));
  },
);

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user!._id.toString();
    const profile = await authService.getProfile(userId);
    res.status(200).json(successResponse(profile));
  },
);

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    // In JWT, logout is handled client-side by removing the token
    // Server-side, we could blacklist the token
    res.status(200).json(successResponse(null, 'Logout successful'));
  },
);
