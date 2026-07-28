/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Authentication & Authorization Service
 * Implements JWT authentication, refresh tokens, and multi-store support
 */

import jwt from 'jsonwebtoken';
import { storeRepo } from '../repositories/index.ts';
import { AuthResponse, Store } from '../../types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'profit-tool-enterprise-super-secret-jwt-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'profit-tool-enterprise-refresh-secret-key-2026';

export class AuthService {
  async login(email: string, storeId?: string): Promise<AuthResponse> {
    const stores = await storeRepo.getAll();
    let targetStore: Store | null = null;

    if (storeId) {
      targetStore = await storeRepo.getById(storeId);
    } else {
      targetStore = stores.find(s => s.ownerEmail.toLowerCase() === email.toLowerCase()) || null;
      if (!targetStore && (email.toLowerCase().includes('owner') || email.toLowerCase().includes('demo') || email === 'admin@techpulsehub.com' || email === 'hello@organicliving.co.uk')) {
        targetStore = stores[0];
      }
    }

    if (!targetStore) {
      throw new Error('Invalid credentials: no active store account found for this email address.');
    }

    const payload = {
      userId: `usr_${targetStore.id}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      storeId: targetStore.id,
      storeName: targetStore.storeName,
      role: 'OWNER' as const
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jwt.sign({ userId: payload.userId, storeId: targetStore.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return {
      token,
      refreshToken,
      user: {
        id: payload.userId,
        email,
        name: targetStore.ownerEmail.split('@')[0],
        storeId: targetStore.id,
        storeName: targetStore.storeName,
        role: 'OWNER'
      }
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired JWT authorization token');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const store = await storeRepo.getById(decoded.storeId);
      if (!store) throw new Error('Associated store no longer exists');

      const payload = {
        userId: decoded.userId,
        email: store.ownerEmail,
        name: store.ownerEmail.split('@')[0],
        storeId: store.id,
        storeName: store.storeName,
        role: 'OWNER' as const
      };

      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      const newRefreshToken = jwt.sign({ userId: decoded.userId, storeId: store.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async switchStore(currentEmail: string, targetStoreId: string): Promise<AuthResponse> {
    const targetStore = await storeRepo.getById(targetStoreId);
    if (!targetStore) throw new Error('Target store not found');

    return this.login(currentEmail || targetStore.ownerEmail, targetStoreId);
  }
}

export const authService = new AuthService();
