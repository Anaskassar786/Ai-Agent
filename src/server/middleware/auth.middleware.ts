/**
 * PROFIT TOOL — Enterprise Authentication & Access Control Middleware
 * Implements JWT token validation and Role-Based Access Control (RBAC)
 * enforcing strict data isolation between Shopify merchant stores (Document 13B).
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EnterpriseLogger } from '../utils/logger.util.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'profit_tool_enterprise_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'STAFF';
    storeId: string;
    storeName: string;
  };
}

export class AuthMiddleware {
  /**
   * Verifies Bearer JWT token in Authorization header.
   * Attaches decoded merchant user profile to req.user.
   */
  public static verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      EnterpriseLogger.warn('Authentication failed: Missing or invalid Authorization header', {
        ipAddress: req.ip,
        path: req.path
      });
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Valid JWT Bearer token required to access enterprise resources.' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
      req.user = decoded;
      next();
    } catch (error) {
      EnterpriseLogger.warn('Authentication failed: Expired or invalid token', {
        ipAddress: req.ip,
        path: req.path
      });
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'JWT token is expired or cryptographically invalid.' 
      });
      return;
    }
  }

  /**
   * Enforces Role-Based Access Control (RBAC) allowing only specified roles.
   * Example: AuthMiddleware.requireRole(['OWNER'])
   */
  public static requireRole(allowedRoles: Array<'OWNER' | 'STAFF'>) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        EnterpriseLogger.warn(`RBAC Permission Denied: User ${req.user.email} attempted to access restricted resource`, {
          actorId: req.user.id,
          actorRole: req.user.role,
          storeId: req.user.storeId,
          path: req.path
        });
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `Access denied. Resource requires one of the following roles: ${allowedRoles.join(', ')}.` 
        });
        return;
      }

      next();
    };
  }
}
