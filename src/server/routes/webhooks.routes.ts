/**
 * PROFIT TOOL — Shopify Webhook Routes
 */
import { Router } from 'express';
import { shopifyController } from '../controllers/index.ts';
import { ShopifyMiddleware } from '../middleware/shopify.middleware.ts';

const router = Router();

// Official HMAC Verified Webhook endpoint
router.post('/shopify/*all', ShopifyMiddleware.verifyHmac, (req, res) => shopifyController.handleWebhook(req, res));

// Test webhook simulation endpoint
router.post('/test/trigger-abandoned-cart', (req, res) => shopifyController.triggerTestCart(req, res));

export default router;
