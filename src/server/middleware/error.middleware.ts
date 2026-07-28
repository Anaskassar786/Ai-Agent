/**
 * PROFIT TOOL — Global Enterprise Error & Observability Middleware
 * Implements centralized exception handling, request auditing, and safe error reporting (Document 13B).
 */

import { Request, Response, NextFunction } from 'express';
import { EnterpriseLogger } from '../utils/logger.util.ts';

export class ErrorMiddleware {
  /**
   * Request logging middleware that tracks API execution latency and status codes.
   */
  public static requestLogger(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logContext = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };

      if (res.statusCode >= 500) {
        EnterpriseLogger.error(`HTTP Server Error: ${req.method} ${req.originalUrl}`, undefined, logContext);
      } else if (res.statusCode >= 400) {
        EnterpriseLogger.warn(`HTTP Client Warning: ${req.method} ${req.originalUrl}`, logContext);
      } else {
        EnterpriseLogger.info(`HTTP Request completed: ${req.method} ${req.originalUrl}`, logContext);
      }
    });

    next();
  }

  /**
   * Global fallback exception handler. Prevents stack traces from leaking to clients in production.
   */
  public static errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    EnterpriseLogger.error(`Unhandled Exception in ${req.method} ${req.path}`, err, {
      status,
      ipAddress: req.ip,
      body: req.body
    });

    res.status(status).json({
      error: status >= 500 ? 'Internal Server Error' : 'Request Error',
      message: process.env.NODE_ENV === 'production' && status >= 500
        ? 'An unexpected error occurred in the enterprise decision engine.'
        : message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
}
