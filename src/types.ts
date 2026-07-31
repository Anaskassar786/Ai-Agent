/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Enterprise AI Decision Support System for Shopify Merchants
 * Core Domain Schema & Types
 */

export type RecommendationPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type RecommendationStatus = 
  | 'Open' 
  | 'Completed' 
  | 'Snoozed' 
  | 'Blocked' 
  | 'Updated' 
  | 'Suppressed' 
  | 'Archived' 
  | 'Expired';

export type RuleType = 'CORE' | 'EDGE' | 'CUSTOM';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR';

export interface Store {
  id: string;
  shopifyDomain: string;
  storeName: string;
  ownerEmail: string;
  currency: CurrencyCode;
  installedAt: string;
  isActive: boolean;
  accessToken?: string;
  activePlan: 'Starter' | 'Growth' | 'Scale';
}

export interface StoreConfig {
  storeId: string;
  minCartValueThreshold: number;
  abandonedTimeoutMinutes: number;
  autoSnoozeDays: number;
  enableDailyEmailDigest: boolean;
  enableCriticalEmailAlerts: boolean;
  enableInAppAlerts: boolean;
  notificationEmail: string;
  currencySymbol: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  storeId: string;
  shopifyCustomerId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalOrders: number;
  totalSpent: number;
  isVIP: boolean;
  lastOrderDate?: string;
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  image?: string;
  inStock: boolean;
}

export interface Cart {
  id: string;
  storeId: string;
  shopifyCartId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  totalValue: number;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  abandonedAt?: string;
  checkoutUrl: string;
  status: 'Active' | 'Abandoned' | 'Recovered' | 'Expired';
  discountCode?: string;
  shippingCountry?: string;
}

export interface RuleExecution {
  ruleId: string;
  ruleName: string;
  ruleType: RuleType;
  version: number;
  fired: boolean;
  weight: number;
  explanation: string;
  actualValue?: string | number | boolean;
  thresholdValue?: string | number | boolean;
}

export interface EvidenceSnapshot {
  snapshotId: string;
  recommendationId: string;
  cartId: string;
  evaluatedAt: string;
  cartValueAtEval: number;
  customerTotalSpentAtEval: number;
  customerTotalOrdersAtEval: number;
  cartAgeHours: number;
  itemsSnapshot: CartItem[];
  rulesFired: RuleExecution[];
  rawAiReasoning: string;
  version: number;
}

export interface Recommendation {
  id: string;
  storeId: string;
  cartId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  title: string;
  reason: string;
  actionSummary: string;
  suggestedActionType: 'VIP_PERSONAL_REACHOUT' | 'DISCOUNT_RECOVERY' | 'STOCK_REPLACEMENT' | 'BUNDLE_UPSELL' | 'SHIPPING_INCENTIVE' | 'URGENCY_REMINDER';
  priority: RecommendationPriority;
  status: RecommendationStatus;
  confidenceScore: number; // 0 to 100
  opportunityValue: number;
  recoveryProbability: number;
  recommendedDiscount: number;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  snoozedUntil?: string;
  completedAt?: string;
  currentEvidenceSnapshotId: string;
  evidenceHistory: EvidenceSnapshot[];
  rulesFiredCount: number;
  auditHistory: AuditLogEntry[];
}

export interface RuleVersion {
  id: string;
  ruleId: string;
  storeId: string;
  name: string;
  description: string;
  ruleType: RuleType;
  version: number;
  isActive: boolean;
  priorityWeight: number; // e.g. 15, 30
  conditionField: 'cart.totalValue' | 'customer.totalOrders' | 'cart.ageHours' | 'customer.isVIP' | 'cart.itemCount' | 'cart.shippingCountry';
  operator: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE' | 'IN' | 'CONTAINS';
  thresholdValue: string | number | boolean;
  createdAt: string;
  createdBy: string;
}

export interface AuditLogEntry {
  id: string;
  storeId: string;
  entityId: string;
  entityType: 'RECOMMENDATION' | 'RULE' | 'CART' | 'CONFIG' | 'AUTH' | 'BILLING';
  action: string;
  actor: string; // e.g. 'MERCHANT_USER' | 'AI_ENGINE' | 'SHOPIFY_WEBHOOK' | 'RULE_ENGINE'
  previousStatus?: string;
  newStatus?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type AuditLog = AuditLogEntry;

export interface MerchantFeedback {
  id: string;
  recommendationId: string;
  storeId: string;
  isUseful: boolean;
  reason?: string;
  comments?: string;
  createdAt: string;
}

export interface NotificationAlert {
  id: string;
  storeId: string;
  title: string;
  message: string;
  type: 'CRITICAL_RECOMMENDATION' | 'WEBHOOK_RECEIVED' | 'BILLING_UPDATED' | 'DAILY_DIGEST' | 'SYSTEM';
  isRead: boolean;
  linkToId?: string;
  createdAt: string;
}

export interface BillingPlan {
  id: 'Starter' | 'Growth' | 'Scale';
  name: string;
  priceMonthly: number;
  maxOrdersPerMonth: number;
  maxRecommendations: number;
  features: string[];
  isCurrent: boolean;
}

export interface DashboardMetrics {
  totalRecoverableRevenue: number;
  activeRecommendationsCount: number;
  recoveryRatePercent: number;
  averageConfidenceScore: number;
  completedRecommendationsCount: number;
  usefulFeedbackPercent: number;
  priorityDistribution: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  revenueTrend: {
    date: string;
    recoverable: number;
    recovered: number;
  }[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    storeId: string;
    storeName: string;
    role: 'OWNER' | 'ADMIN' | 'ANALYST';
  };
}
