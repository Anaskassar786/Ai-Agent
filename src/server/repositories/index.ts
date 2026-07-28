/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Enterprise Repository Layer
 * Adheres strictly to Repository Pattern and SOLID principles
 */

import { db } from '../db/index.ts';
import {
  Store,
  StoreConfig,
  Customer,
  Cart,
  Recommendation,
  EvidenceSnapshot,
  RuleVersion,
  AuditLogEntry,
  MerchantFeedback,
  NotificationAlert,
  BillingPlan
} from '../../types.ts';

export class StoreRepository {
  async getAll(): Promise<Store[]> {
    return db.getStores();
  }

  async getById(id: string): Promise<Store | null> {
    return db.getStoreById(id) || null;
  }

  async getByDomain(domain: string): Promise<Store | null> {
    return db.getStoreByDomain(domain) || null;
  }

  async save(store: Store): Promise<Store> {
    return db.saveStore(store);
  }
}

export class ConfigRepository {
  async getByStoreId(storeId: string): Promise<StoreConfig> {
    return db.getStoreConfig(storeId);
  }

  async update(storeId: string, updates: Partial<StoreConfig>, actor?: string): Promise<StoreConfig> {
    return db.updateStoreConfig(storeId, updates, actor);
  }
}

export class CustomerRepository {
  async getByStoreId(storeId: string): Promise<Customer[]> {
    return db.getCustomers(storeId);
  }

  async getById(id: string): Promise<Customer | null> {
    return db.getCustomerById(id) || null;
  }

  async getByShopifyId(storeId: string, shopifyId: string): Promise<Customer | null> {
    return db.getCustomerByShopifyId(storeId, shopifyId) || null;
  }

  async save(customer: Customer): Promise<Customer> {
    return db.saveCustomer(customer);
  }
}

export class CartRepository {
  async getByStoreId(storeId: string): Promise<Cart[]> {
    return db.getCarts(storeId);
  }

  async getById(id: string): Promise<Cart | null> {
    return db.getCartById(id) || null;
  }

  async getByShopifyId(storeId: string, shopifyId: string): Promise<Cart | null> {
    return db.getCartByShopifyId(storeId, shopifyId) || null;
  }

  async save(cart: Cart): Promise<Cart> {
    return db.saveCart(cart);
  }
}

export class RecommendationRepository {
  async getByStoreId(storeId: string): Promise<Recommendation[]> {
    return db.getRecommendations(storeId);
  }

  async getById(id: string): Promise<Recommendation | null> {
    return db.getRecommendationById(id) || null;
  }

  async getActiveByCartId(cartId: string): Promise<Recommendation | null> {
    return db.getActiveRecommendationByCartId(cartId) || null;
  }

  async save(rec: Recommendation, actor?: string, actionName?: string): Promise<Recommendation> {
    return db.saveRecommendation(rec, actor, actionName);
  }

  async getEvidenceHistory(recId: string): Promise<EvidenceSnapshot[]> {
    return db.getEvidenceHistoryForRecommendation(recId);
  }

  async saveEvidence(snapshot: EvidenceSnapshot): Promise<EvidenceSnapshot> {
    return db.saveEvidenceSnapshot(snapshot);
  }
}

export class RuleRepository {
  async getByStoreId(storeId: string): Promise<RuleVersion[]> {
    return db.getRuleVersions(storeId);
  }

  async getActiveByStoreId(storeId: string): Promise<RuleVersion[]> {
    return db.getActiveRules(storeId);
  }

  async save(rule: RuleVersion, actor?: string): Promise<RuleVersion> {
    return db.saveRuleVersion(rule, actor);
  }
}

export class AuditRepository {
  async getByStoreId(storeId: string, limit?: number): Promise<AuditLogEntry[]> {
    return db.getAuditLogs(storeId, limit);
  }
}

export class FeedbackRepository {
  async getByStoreId(storeId: string): Promise<MerchantFeedback[]> {
    return db.getFeedbackForStore(storeId);
  }

  async save(feedback: MerchantFeedback): Promise<MerchantFeedback> {
    return db.saveFeedback(feedback);
  }
}

export class NotificationRepository {
  async getByStoreId(storeId: string): Promise<NotificationAlert[]> {
    return db.getNotifications(storeId);
  }

  async markAsRead(id: string): Promise<void> {
    db.markNotificationAsRead(id);
  }

  async markAllAsRead(storeId: string): Promise<void> {
    db.markAllNotificationsAsRead(storeId);
  }
}

export class BillingRepository {
  async getPlans(): Promise<BillingPlan[]> {
    return db.getBillingPlans();
  }

  async switchPlan(storeId: string, planId: 'Starter' | 'Growth' | 'Scale'): Promise<Store> {
    return db.switchPlan(storeId, planId);
  }
}

// Export singletons for injection
export const storeRepo = new StoreRepository();
export const configRepo = new ConfigRepository();
export const customerRepo = new CustomerRepository();
export const cartRepo = new CartRepository();
export const recRepo = new RecommendationRepository();
export const ruleRepo = new RuleRepository();
export const auditRepo = new AuditRepository();
export const feedbackRepo = new FeedbackRepository();
export const notifRepo = new NotificationRepository();
export const billingRepo = new BillingRepository();
