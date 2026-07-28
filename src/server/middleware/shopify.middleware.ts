/**
 * PROFIT TOOL — Shopify Webhook HMAC Verification Middleware
 * Validates X-Shopify-Hmac-Sha256 cryptographic signatures to protect
 * automated decision pipelines from spoofing or replay attacks (Document 13B).
 */

import { Request, Response, NextFunction } from 'express';
import { CryptoUtils } from '../utils/crypto.util.ts';
import { EnterpriseLogger } from '../utils/logger.util.ts';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'shopify_enterprise_webhook_secret_2026';

export class ShopifyMiddleware {
  /**
   * Validates HMAC signature header against raw request body.
   */
  public static verifyHmac(req: Request, res: Response, next: NextFunction): void {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string || 'unknown-shop';
    const topic = req.headers['x-shopify-topic'] as string || 'unknown-topic';

    if (!hmacHeader) {
      EnterpriseLogger.warn('Shopify Webhook rejected: Missing HMAC header', {
        shopDomain,
        topic,
        ipAddress: req.ip
      });
      res.status(401).json({ error: 'Unauthorized', message: 'Missing X-Shopify-Hmac-Sha256 signature header.' });
      return;
    }

    // Convert request body to string or buffer for verification
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const isValid = CryptoUtils.verifyShopifyHmac(rawBody, hmacHeader, SHOPIFY_WEBHOOK_SECRET);

    if (!isValid) {
      EnterpriseLogger.warn('Shopify Webhook rejected: HMAC cryptographic signature mismatch', {
        shopDomain,
        topic,
        ipAddress: req.ip
      });
      res.status(401).json({ error: 'Unauthorized', message: 'HMAC signature verification failed.' });
      return;
    }

    EnterpriseLogger.debug(`Verified Shopify webhook HMAC for topic ${topic}`, { shopDomain });
    next();
  }
}
