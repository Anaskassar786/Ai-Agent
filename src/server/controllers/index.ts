/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Enterprise API Controllers
 * Handles REST requests, validation, and routing to service layers
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.ts';
import { shopifyService } from '../services/shopify.service.ts';
import { aiService } from '../services/ai.service.ts';
import { ruleService } from '../services/rule.service.ts';
import {
  storeRepo,
  configRepo,
  customerRepo,
  cartRepo,
  recRepo,
  ruleRepo,
  auditRepo,
  feedbackRepo,
  notifRepo,
  billingRepo
} from '../repositories/index.ts';
import { DashboardMetrics, RecommendationPriority, RecommendationStatus } from '../../types.ts';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email(),
  storeId: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['Open', 'Completed', 'Snoozed', 'Blocked', 'Updated', 'Suppressed', 'Archived', 'Expired']),
  snoozedUntil: z.string().optional()
});

const feedbackSchema = z.object({
  isUseful: z.boolean(),
  reason: z.string().optional(),
  comments: z.string().optional()
});

const customRuleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  priorityWeight: z.number().min(1).max(100),
  conditionField: z.enum(['cart.totalValue', 'customer.totalOrders', 'cart.ageHours', 'customer.isVIP', 'cart.itemCount', 'cart.shippingCountry']),
  operator: z.enum(['GT', 'LT', 'EQ', 'GTE', 'LTE', 'IN', 'CONTAINS']),
  thresholdValue: z.union([z.string(), z.number(), z.boolean()])
});

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, storeId } = loginSchema.parse(req.body);
      const result = await authService.login(email, storeId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Authentication failed' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'refreshToken required' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Token refresh failed' });
    }
  }

  async switchStore(req: Request, res: Response): Promise<void> {
    try {
      const { targetStoreId } = req.body;
      const user = (req as any).user;
      const result = await authService.switchStore(user?.email || 'admin@example.com', targetStoreId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to switch store' });
    }
  }
}

export class StoreController {
  async listStores(req: Request, res: Response): Promise<void> {
    try {
      const stores = await storeRepo.getAll();
      res.status(200).json(stores);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
        req.query.storeId as string ||
  (req as any).user?.storeId ||
  'store_fashionista';const storeId = req.params.storeId || (req as any).user?.storeId;
      const config = await configRepo.getByStoreId(storeId);
      res.status(200).json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.params.storeId || (req as any).user?.storeId;
      const actor = (req as any).user?.name || 'MERCHANT_USER';
      const updated = await configRepo.update(storeId, req.body, actor);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export class RecommendationController {
  async listRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      let recs = await recRepo.getByStoreId(storeId);

      const { priority, status, search, sortBy } = req.query;

      if (priority && priority !== 'All') {
        recs = recs.filter(r => r.priority.toLowerCase() === String(priority).toLowerCase());
      }
      if (status && status !== 'All') {
        recs = recs.filter(r => r.status.toLowerCase() === String(status).toLowerCase());
      }
      if (search) {
        const q = String(search).toLowerCase();
        recs = recs.filter(r => 
          r.title.toLowerCase().includes(q) || 
          r.reason.toLowerCase().includes(q) || 
          (r.customerName && r.customerName.toLowerCase().includes(q))
        );
      }

      if (sortBy === 'confidence') {
        recs.sort((a, b) => b.confidenceScore - a.confidenceScore);
      } else if (sortBy === 'value') {
        recs.sort((a, b) => b.opportunityValue - a.opportunityValue);
      } else {
        // Default sort by priority and newest
        const prioOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        recs.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      res.status(200).json(recs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const rec = await recRepo.getById(req.params.id);
      if (!rec) {
        res.status(404).json({ error: 'Recommendation not found' });
        return;
      }
      res.status(200).json(rec);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getEvidenceHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await recRepo.getEvidenceHistory(req.params.id);
      res.status(200).json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, snoozedUntil } = updateStatusSchema.parse(req.body);
      const rec = await recRepo.getById(req.params.id);
      if (!rec) {
        res.status(404).json({ error: 'Recommendation not found' });
        return;
      }

      const actor = (req as any).user?.name || 'MERCHANT_USER';
      rec.status = status as RecommendationStatus;
      if (status === 'Completed') rec.completedAt = new Date().toISOString();
      if (status === 'Snoozed' && snoozedUntil) rec.snoozedUntil = snoozedUntil;

      const updated = await recRepo.save(rec, actor, `STATUS_CHANGED_TO_${status.toUpperCase()}`);
      
      // If completed, check if cart can be marked recovered
      if (status === 'Completed') {
        const cart = await cartRepo.getById(rec.cartId);
        if (cart) {
          cart.status = 'Recovered';
          await cartRepo.save(cart);
        }
      }

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const data = feedbackSchema.parse(req.body);
      const rec = await recRepo.getById(req.params.id);
      if (!rec) {
        res.status(404).json({ error: 'Recommendation not found' });
        return;
      }

      const storeId = (req as any).user?.storeId || rec.storeId;
      const feedback = {
        id: `fb_${Date.now()}`,
        recommendationId: rec.id,
        storeId,
        isUseful: data.isUseful,
        reason: data.reason,
        comments: data.comments,
        createdAt: new Date().toISOString()
      };

      const saved = await feedbackRepo.save(feedback);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export class RuleController {
  async listRules(req: Request, res: Response): Promise<void> {
    try {
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      const rules = await ruleRepo.getByStoreId(storeId);
      res.status(200).json(rules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async createCustomRule(req: Request, res: Response): Promise<void> {
    try {
      const data = customRuleSchema.parse(req.body);
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      const actor = (req as any).user?.name || 'MERCHANT_ADMIN';
      const created = await ruleService.saveCustomRule(storeId, data, actor);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async toggleRule(req: Request, res: Response): Promise<void> {
    try {
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      const rules = await ruleRepo.getByStoreId(storeId);
      const target = rules.find(r => r.id === req.params.id || r.ruleId === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Rule not found' });
        return;
      }

      target.isActive = !target.isActive;
      target.version += 1;
      const updated = await ruleRepo.save(target, (req as any).user?.name || 'MERCHANT_ADMIN');
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async simulateCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartValue, itemCount, vip, ageHours, discountCode } = req.body;
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      const store = await storeRepo.getById(storeId);

      const simCart: any = {
        id: `sim_${Date.now()}`,
        storeId,
        totalValue: Number(cartValue) || 250,
        currency: store?.currency || 'USD',
        createdAt: new Date(Date.now() - (Number(ageHours) || 2) * 3600 * 1000).toISOString(),
        items: Array.from({ length: Number(itemCount) || 2 }).map((_, idx) => ({
          id: `item_${idx}`,
          title: `Simulated SKU ${idx + 1}`,
          quantity: 1,
          price: (Number(cartValue) || 250) / (Number(itemCount) || 2),
          inStock: true
        }))
      };

      const simCustomer: any = vip ? {
        id: 'sim_cust',
        firstName: 'VIP',
        lastName: 'Simulator',
        isVIP: true,
        totalOrders: 8,
        totalSpent: 4200
      } : null;

      const executions = await ruleService.evaluateCartRules(simCart, simCustomer);
      res.status(200).json({ executions, cartSimulated: simCart });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export class AnalyticsController {
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const storeId =
  req.query.storeId as string ||
  req.headers['x-demo-store-id'] as string ||
  (req as any).user?.storeId ||
  'store_fashionista';
      const recs = await recRepo.getByStoreId(storeId);
      const feedback = await feedbackRepo.getByStoreId(storeId);

      let totalRecoverableRevenue = 0;
      let completedCount = 0;
      let totalScore = 0;

      const priorityDistribution = { Critical: 0, High: 0, Medium: 0, Low: 0 };

      for (const r of recs) {
        totalRecoverableRevenue += r.opportunityValue;
        if (r.status === 'Completed') completedCount++;
        totalScore += r.confidenceScore;
        priorityDistribution[r.priority] = (priorityDistribution[r.priority] || 0) + 1;
      }

      const recoveryRatePercent = recs.length > 0 ? Math.round((completedCount / recs.length) * 100) : 0;
      const averageConfidenceScore = recs.length > 0 ? Math.round(totalScore / recs.length) : 0;
      
      const usefulCount = feedback.filter(f => f.isUseful).length;
      const usefulFeedbackPercent = feedback.length > 0 ? Math.round((usefulCount / feedback.length) * 100) : 100;

      // 7-day trend chart
      const now = new Date();

const revenueTrend = Array.from({ length: 7 }).map((_, idx) => {
  const d = new Date(now.getTime() - (6 - idx) * 24 * 3600 * 1000);

  const day = d.toISOString().split('T')[0];

  const dayRecs = recs.filter(r =>
    r.createdAt.startsWith(day)
  );

  return {
    date: d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    recoverable: Math.round(
      dayRecs.reduce((sum, r) => sum + r.opportunityValue, 0)
    ),
    recovered: Math.round(
      dayRecs
        .filter(r => r.status === 'Completed')
        .reduce((sum, r) => sum + r.opportunityValue, 0)
    )
  };
});

      const metrics: DashboardMetrics = {
        totalRecoverableRevenue,
        activeRecommendationsCount: recs.filter(r => r.status !== 'Completed' && r.status !== 'Archived').length,
        recoveryRatePercent,
        averageConfidenceScore,
        completedRecommendationsCount: completedCount,
        usefulFeedbackPercent,
        priorityDistribution,
        revenueTrend
      };

      res.status(200).json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async listCartsAndCustomers(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      const carts = await cartRepo.getByStoreId(storeId);
      const customers = await customerRepo.getByStoreId(storeId);
      res.status(200).json({ carts, customers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class AuditController {
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      const limit = Number(req.query.limit) || 100;
      const logs = await auditRepo.getByStoreId(storeId, limit);
      res.status(200).json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class NotificationController {
  async listNotifications(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      const notifs = await notifRepo.getByStoreId(storeId);
      res.status(200).json(notifs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      await notifRepo.markAsRead(req.params.id);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      await notifRepo.markAllAsRead(storeId);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

	export class BillingController {
  async listPlans(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      const store = await storeRepo.getById(storeId);
      const plans = await billingRepo.getPlans();
      const updatedPlans = plans.map(p => ({
        ...p,
        isCurrent: p.id === store?.activePlan
      }));
      res.status(200).json(updatedPlans);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const storeId = (req as any).user?.storeId || 'store_fashionista';
      const { planId } = req.body;
      if (!['Launch', 'Growth', 'Pro'].includes(planId)) {
  throw new Error('Invalid plan selected');
}
      const store = await billingRepo.updateSubscription(storeId, {
  activePlan: planId,
  planName: planId,
  subscriptionStatus: 'ACTIVE',
  billingApproved: true,
  planActivatedAt: new Date().toISOString(),
  recommendationsUsed: 0,
  recommendationsLimit: 300
});
      res.status(200).json({ success: true, activePlan: store.activePlan, confirmationUrl: `/dashboard?plan=${planId}&status=active` });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export class ShopifyController { 
        async install(req: Request, res: Response): Promise<void> {
    const shop = req.query.shop as string;

     if (!shop) {
  res.status(400).send('Missing shop parameter');
  return;
}

const apiKey = process.env.SHOPIFY_API_KEY;

const scopes = process.env.SHOPIFY_SCOPES ||
  'read_orders,read_customers,read_products,read_checkouts,write_checkouts';

const redirectUri = `${process.env.APP_URL}/api/shopify/callback`;
    const installUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${apiKey}` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    res.redirect(installUrl);
  }

  async callback(req: Request, res: Response): Promise<void> {
  console.log('SHOPIFY CALLBACK HIT', req.query);
  
    try {
      const shop = req.query.shop as string;
      const code = req.query.code as string;

      if (!shop || !code) {
      throw new Error('Missing Shopify OAuth parameters');
  }
      const store = await shopifyService.handleOAuthCallback(shop, code);
      // Redirect to dashboard with auto-login token
      res.redirect(`/?shop=${shop}&installed=true&storeId=${store.id}`);
    } catch (err: any) {
      res.status(500).send(`Shopify OAuth Installation failed: ${err.message}`);
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const topic = req.headers['x-shopify-topic'] as string || 'carts/update';
      const shopDomain = req.headers['x-shopify-shop-domain'] as string || 'fashionista-boutique.myshopify.com';
      const hmac = req.headers['x-shopify-hmac-sha256'] as string | undefined;

      // In production, verify HMAC SHA256:
      // const isValid = shopifyService.verifyWebhookHmac((req as any).rawBody || JSON.stringify(req.body), hmac);
      
      await shopifyService.processWebhook(topic, shopDomain, req.body);
      res.status(200).send('OK');
    } catch (err: any) {
      console.error('Webhook handling error:', err);
      res.status(500).send(err.message);
    }
  }

  async triggerTestCart(req: Request, res: Response): Promise<void> {
    try {
      const { shopDomain, totalValue, customerEmail, customerName, isVIP, discountCode } = req.body;
      const domain = shopDomain || 'fashionista-boutique.myshopify.com';
      const store = await storeRepo.getByDomain(domain) || (await storeRepo.getAll())[0];

      if (!store) {
        res.status(400).json({ error: 'Store not found' });
        return;
      }

      const payload = {
        id: `test_${Date.now()}`,
        email: customerEmail || 'alex.mercer@vipbuyer.com',
        total_price: String(totalValue || 650.00),
        discount_codes: discountCode ? [{ code: discountCode }] : [{ code: 'SAVE15' }],
        shipping_address: {
          first_name: customerName ? customerName.split(' ')[0] : 'Alex',
          last_name: customerName ? customerName.split(' ')[1] || 'Mercer' : 'Mercer',
          country_code: 'US'
        },
        line_items: [
          { title: 'Platinum Series Mechanical Chronograph', sku: 'PLAT-CHRONO-01', quantity: 1, price: String((Number(totalValue) || 650) * 0.7), in_stock: true },
          { title: 'Artisan Leather Watch Strap', sku: 'STRAP-TAN', quantity: 1, price: String((Number(totalValue) || 650) * 0.3), in_stock: false } // Trigger stock replacement!
        ]
      };

      // Also ensure customer exists
      if (isVIP || customerEmail) {
        const custs = await customerRepo.getByStoreId(store.id);
        if (!custs.find(c => c.email === payload.email)) {
          await customerRepo.save({
            id: `cust_${Date.now()}`,
            storeId: store.id,
            shopifyCustomerId: `sh_test_${Date.now()}`,
            email: payload.email,
            firstName: payload.shipping_address.first_name,
            lastName: payload.shipping_address.last_name,
            totalOrders: isVIP ? 7 : 2,
            totalSpent: isVIP ? 3890.00 : 250.00,
            isVIP: Boolean(isVIP ?? true),
            lastOrderDate: new Date().toISOString(),
            tags: isVIP ? ['VIP', 'Test-Created'] : ['Test-Created'],
            createdAt: new Date().toISOString()
          });
        }
      }

      await shopifyService.processWebhook('carts/update', store.shopifyDomain, payload);
      const activeRecs = await recRepo.getByStoreId(store.id);
      res.status(200).json({ success: true, message: `Simulated abandoned cart webhook processed for ${store.storeName}!`, activeRecommendationsCount: activeRecs.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const authController = new AuthController();
export const storeController = new StoreController();
export const recController = new RecommendationController();
export const ruleController = new RuleController();
export const analyticsController = new AnalyticsController();
export const auditController = new AuditController();
export const notifController = new NotificationController();
export const billingController = new BillingController();
export const shopifyController = new ShopifyController();
