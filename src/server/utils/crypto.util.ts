/**
 * PROFIT TOOL — Cryptographic Security Utilities
 * Implements HMAC SHA-256 verification for Shopify webhooks and
 * cryptographic hashing for immutable evidence snapshots (Document 13B).
 */

import crypto from 'crypto';

export class CryptoUtils {
  /**
   * Verifies timing-safe HMAC SHA-256 signature from Shopify webhooks.
   * @param rawBody - The raw string or buffer payload received from Shopify
   * @param hmacHeader - The X-Shopify-Hmac-Sha256 header value
   * @param secret - The Shopify App Client Secret or Webhook Signing Secret
   */
  public static verifyShopifyHmac(rawBody: string | Buffer, hmacHeader: string, secret: string): boolean {
    if (!hmacHeader || !secret) {
      return false;
    }

    try {
      const dataBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8');
      const generatedHmac = crypto
        .createHmac('sha256', secret)
        .update(dataBuffer)
        .digest('base64');

      const generatedBuffer = Buffer.from(generatedHmac, 'utf8');
      const headerBuffer = Buffer.from(hmacHeader, 'utf8');

      if (generatedBuffer.length !== headerBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(generatedBuffer, headerBuffer);
    } catch (err) {
      return false;
    }
  }

  /**
   * Generates a cryptographic SHA-256 hash for immutable evidence snapshots
   * ensuring data non-repudiation in enterprise audits.
   * @param snapshotData - JSON object representing the cart and rule state at evaluation time
   */
  public static generateEvidenceHash(snapshotData: Record<string, any>): string {
    const canonicalString = JSON.stringify(snapshotData, Object.keys(snapshotData).sort());
    return crypto
      .createHash('sha256')
      .update(canonicalString, 'utf8')
      .digest('hex');
  }

  /**
   * Generates a secure random identifier with optional prefix
   */
  public static generateSecureId(prefix = 'id'): string {
    const randomHex = crypto.randomBytes(12).toString('hex');
    return `${prefix}_${randomHex}`;
  }
}
