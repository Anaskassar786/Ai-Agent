/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Enterprise Relational Database Engine
 * Implements full PostgreSQL referential integrity, immutable evidence snapshots,
 * and immutable audit logs with instant pre-seeded Shopify merchant test data.
 */

import crypto from 'crypto';

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
  BillingPlan,
  RuleExecution
} from '../../types.ts';
import { pool } from './client.ts';

class DatabaseEngine {
  private stores: Map<string, Store> = new Map();
  private configs: Map<string, StoreConfig> = new Map();
  private customers: Map<string, Customer> = new Map();
  private carts: Map<string, Cart> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private evidenceSnapshots: Map<string, EvidenceSnapshot> = new Map();
  private ruleVersions: Map<string, RuleVersion> = new Map();
  private auditLogs: AuditLogEntry[] = []; // Immutable append-only log
  private feedback: Map<string, MerchantFeedback> = new Map();
  private notifications: Map<string, NotificationAlert> = new Map();
  private billingPlans: Map<string, BillingPlan> = new Map();

  constructor() {
    this.initBillingPlans();
    this.seedEnterpriseData().catch((err) => {
      console.error("❌ Seed failed:", err);
    });
  }

  private initBillingPlans() {
    this.billingPlans.set('Launch', {
  id: 'Launch',
  name: 'Launch Plan',
      priceMonthly: 19,
      maxOrdersPerMonth: 500,
      maxRecommendations: 300,
      features: ['Core Abandoned Cart Detection', 'Basic AI Reasoning', 'Daily Email Digest', 'Standard Rule Engine', '7-day Evidence Retention'],
      isCurrent: false
    });
    this.billingPlans.set('Growth', {
      id: 'Growth',
      name: 'Growth Plan',
      priceMonthly: 49,
      maxOrdersPerMonth: 2500,
      maxRecommendations: 3000,
      features: ['VIP Customer Detection', 'Advanced Explainable AI', 'Instant Critical Email Alerts', 'Custom Edge Rules', '30-day Immutable Evidence', 'Multi-currency Support'],
      isCurrent: true
    });
    this.billingPlans.set('Pro', {
  id: 'Pro',
  name: 'Pro Plan',
      priceMonthly: 99,
      maxOrdersPerMonth: 50000,
      maxRecommendations: -1,
      features: ['Real-time Cart Intelligence', 'Custom AI Scoring Weights', 'Unlimited Rule Versioning', 'Infinite Immutable Evidence & Audit Log', 'Dedicated Webhook Priority Queue', 'Multi-store Synchronization'],
      isCurrent: false
    });
  }

  private async seedEnterpriseData() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1000).toISOString();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 3600 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

    // 1. Stores
    const store1: Store = {
      id: 'store_fashionista',
      shopifyDomain: 'fashionista-boutique.myshopify.com',
      storeName: 'Fashionista Boutique',
      ownerEmail: 'owner@fashionistaboutique.com',
      currency: 'USD',
      installedAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
      accessToken: 'shpca_sample_token_fashionista',
      activePlan: 'Launch'
    };
    const store2: Store = {
      id: 'store_techpulse',
      shopifyDomain: 'techpulse-hub.myshopify.com',
      storeName: 'TechPulse Hub',
      ownerEmail: 'admin@techpulsehub.com',
      currency: 'EUR',
      installedAt: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
      accessToken: 'shpca_sample_token_techpulse',
      activePlan: 'Growth'
    };
    const store3: Store = {
      id: 'store_organic',
      shopifyDomain: 'organic-living.myshopify.com',
      storeName: 'Organic Living Home',
      ownerEmail: 'hello@organicliving.co.uk',
      currency: 'GBP',
      installedAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
      accessToken: 'shpca_sample_token_organic',
      activePlan: 'Pro'
    };

    this.stores.set(store1.id, store1);
    this.stores.set(store2.id, store2);
    this.stores.set(store3.id, store3);
    console.log("🌱 Starting PostgreSQL seed...");
    
    await pool.query(
  `
    INSERT INTO stores (
    id,
    shopify_domain,
    store_name,
    owner_email,
    owner_name,
    currency,
    installed_at,
    is_active,
    access_token,
    active_plan
  )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10),
    ($11,$12,$13,$14,$15,$16,$17,$18,$19,$20),
    ($21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
  ON CONFLICT (id) DO NOTHING
  `,
  [
    store1.id, store1.shopifyDomain, store1.storeName, store1.ownerEmail, 'Sarah Johnson', store1.currency, store1.installedAt, store1.isActive, store1.accessToken, store1.activePlan,
    store2.id, store2.shopifyDomain, store2.storeName, store2.ownerEmail, 'David Smith',   store2.currency, store2.installedAt, store2.isActive, store2.accessToken, store2.activePlan,
    store3.id, store3.shopifyDomain, store3.storeName, store3.ownerEmail, 'Emma Wilson',   store3.currency, store3.installedAt, store3.isActive, store3.accessToken, store3.activePlan
  ]
).then(() => {
  console.log("✅ Demo stores inserted into PostgreSQL");
}).catch((err) => {
  console.error("❌ Seed insert failed:", err);
});

  console.log("✅ PostgreSQL seed query completed");
    // 2. Store Configs
    this.configs.set(store1.id, {
      storeId: store1.id,
      minCartValueThreshold: 100,
      abandonedTimeoutMinutes: 60,
      autoSnoozeDays: 7,
      enableDailyEmailDigest: true,
      enableCriticalEmailAlerts: true,
      enableInAppAlerts: true,
      notificationEmail: 'owner@fashionistaboutique.com',
      currencySymbol: '$',
      updatedAt: now.toISOString()
    });
    this.configs.set(store2.id, {
      storeId: store2.id,
      minCartValueThreshold: 150,
      abandonedTimeoutMinutes: 45,
      autoSnoozeDays: 3,
      enableDailyEmailDigest: true,
      enableCriticalEmailAlerts: true,
      enableInAppAlerts: true,
      notificationEmail: 'admin@techpulsehub.com',
      currencySymbol: '€',
      updatedAt: now.toISOString()
    });
    this.configs.set(store3.id, {
      storeId: store3.id,
      minCartValueThreshold: 75,
      abandonedTimeoutMinutes: 120,
      autoSnoozeDays: 14,
      enableDailyEmailDigest: true,
      enableCriticalEmailAlerts: false,
      enableInAppAlerts: true,
      notificationEmail: 'hello@organicliving.co.uk',
      currencySymbol: '£',
      updatedAt: now.toISOString()
    });

    // 3. Customers
    const cust1: Customer = {
      id: 'cust_sarah',
      storeId: store1.id,
      shopifyCustomerId: 'sh_cust_9102910',
      email: 'sarah.jenkins@example.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      totalOrders: 6,
      totalSpent: 3450.00,
      isVIP: true,
      lastOrderDate: new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
      tags: ['VIP', 'Repeat-Buyer', 'High-LTV', 'Luxury-Pref'],
      createdAt: new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString()
    };
    const cust2: Customer = {
      id: 'cust_marcus',
      storeId: store1.id,
      shopifyCustomerId: 'sh_cust_8291029',
      email: 'marcus.vance@example.com',
      firstName: 'Marcus',
      lastName: 'Vance',
      totalOrders: 1,
      totalSpent: 120.00,
      isVIP: false,
      lastOrderDate: new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString(),
      tags: ['Discount-Seeker', 'Cart-Abandoner'],
      createdAt: new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString()
    };
    const cust3: Customer = {
      id: 'cust_elena',
      storeId: store2.id,
      shopifyCustomerId: 'sh_cust_7182910',
      email: 'elena.rostova@techmail.de',
      firstName: 'Elena',
      lastName: 'Rostova',
      totalOrders: 4,
      totalSpent: 2100.00,
      isVIP: true,
      lastOrderDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
      tags: ['VIP', 'Tech-Enthusiast', 'Early-Adopter'],
      createdAt: new Date(now.getTime() - 210 * 24 * 3600 * 1000).toISOString()
    };
    const cust4: Customer = {
      id: 'cust_david',
      storeId: store3.id,
      shopifyCustomerId: 'sh_cust_6172839',
      email: 'david.miller@organicmail.co.uk',
      firstName: 'David',
      lastName: 'Miller',
      totalOrders: 2,
      totalSpent: 180.00,
      isVIP: false,
      lastOrderDate: new Date(now.getTime() - 20 * 24 * 3600 * 1000).toISOString(),
      tags: ['Eco-Conscious'],
      createdAt: new Date(now.getTime() - 120 * 24 * 3600 * 1000).toISOString()
    };

    this.customers.set(cust1.id, cust1);
    this.customers.set(cust2.id, cust2);
    this.customers.set(cust3.id, cust3);
    this.customers.set(cust4.id, cust4);

    // 4. Carts
    const cart1: Cart = {
      id: 'cart_01_luxury_bag',
      storeId: store1.id,
      shopifyCartId: 'gid://shopify/Cart/c1a892b901a8',
      customerId: cust1.id,
      customerEmail: cust1.email,
      customerName: `${cust1.firstName} ${cust1.lastName}`,
      items: [
        { id: 'item_1', productId: 'prod_italy_bag', variantId: 'var_black_gold', title: 'Milano Artisan Italian Leather Handbag', sku: 'MIL-BAG-BLK', quantity: 1, price: 980.00, inStock: true },
        { id: 'item_2', productId: 'prod_silk_scarf', variantId: 'var_scarf_red', title: 'Como Silk Evening Scarf', sku: 'COMO-SCRF-RD', quantity: 1, price: 260.00, inStock: true }
      ],
      totalValue: 1240.00,
      currency: 'USD',
      createdAt: twoHoursAgo,
      updatedAt: twoHoursAgo,
      abandonedAt: twoHoursAgo,
      checkoutUrl: 'https://fashionista-boutique.myshopify.com/checkouts/c1a892b901a8',
      status: 'Abandoned',
      discountCode: 'VIP20',
      shippingCountry: 'US'
     };

    const cart2: Cart = {
      id: 'cart_02_gaming_rig',
      storeId: store2.id,
      shopifyCartId: 'gid://shopify/Cart/d2b91029102c',
      customerId: cust3.id,
      customerEmail: cust3.email,
      customerName: `${cust3.firstName} ${cust3.lastName}`,
      items: [
        { id: 'item_3', productId: 'prod_rtx_gpu', variantId: 'var_rtx_4080', title: 'AeroTech RTX 4080 Super Gaming Graphics Card', sku: 'AERO-RTX4080S', quantity: 1, price: 1150.00, inStock: false },
        { id: 'item_4', productId: 'prod_psu', variantId: 'var_psu_1000w', title: 'Titanium 1000W ATX 3.0 Power Supply', sku: 'TIT-1000W', quantity: 1, price: 220.00, inStock: true }
      ],
      totalValue: 1370.00,
      currency: 'EUR',
      createdAt: fourHoursAgo,
      updatedAt: fourHoursAgo,
      abandonedAt: fourHoursAgo,
      checkoutUrl: 'https://techpulse-hub.myshopify.com/checkouts/d2b91029102c',
      status: 'Abandoned',
      shippingCountry: 'DE'
    };

    const cart3: Cart = {
      id: 'cart_03_summer_jacket',
      storeId: store1.id,
      shopifyCartId: 'gid://shopify/Cart/e3c91029103d',
      customerId: cust2.id,
      customerEmail: cust2.email,
      customerName: `${cust2.firstName} ${cust2.lastName}`,
      items: [
        { id: 'item_5', productId: 'prod_linen_jacket', variantId: 'var_jacket_navy', title: 'Tailored Amalfi Linen Blazer', sku: 'AMAL-BLZ-NVY', quantity: 1, price: 320.00, inStock: true }
      ],
      totalValue: 320.00,
      currency: 'USD',
      createdAt: twelveHoursAgo,
      updatedAt: twelveHoursAgo,
      abandonedAt: twelveHoursAgo,
      checkoutUrl: 'https://fashionista-boutique.myshopify.com/checkouts/e3c91029103d',
      status: 'Abandoned',
      shippingCountry: 'US'
    };

    const cart4: Cart = {
      id: 'cart_04_cookware',
      storeId: store3.id,
      shopifyCartId: 'gid://shopify/Cart/f4d91029104e',
      customerId: cust4.id,
      customerEmail: cust4.email,
      customerName: `${cust4.firstName} ${cust4.lastName}`,
      items: [
        { id: 'item_6', productId: 'prod_ceramic_set', variantId: 'var_green_set', title: 'EcoChef 10-Piece Non-Toxic Ceramic Cookware Set', sku: 'ECO-COOK-10P', quantity: 1, price: 340.00, inStock: true }
      ],
      totalValue: 340.00,
      currency: 'GBP',
      createdAt: yesterday,
      updatedAt: yesterday,
      abandonedAt: yesterday,
      checkoutUrl: 'https://organic-living.myshopify.com/checkouts/f4d91029104e',
      status: 'Abandoned',
      shippingCountry: 'GB'
    };

    this.carts.set(cart1.id, cart1);
    this.carts.set(cart2.id, cart2);
    this.carts.set(cart3.id, cart3);
    this.carts.set(cart4.id, cart4);

    // 5. Rule Versions
    const rule1: RuleVersion = {
      id: 'rule_v1_vip_high_val',
      ruleId: 'RULE_VIP_HIGH_VAL',
      storeId: store1.id,
      name: 'VIP High-Value Cart Defender',
      description: 'Triggers Critical priority when a VIP returning customer abandons a cart valued over $500.',
      ruleType: 'CORE',
      version: 1,
      isActive: true,
      priorityWeight: 35,
      conditionField: 'cart.totalValue',
      operator: 'GTE',
      thresholdValue: 500,
      createdAt: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
      createdBy: 'System Engine'
    };
    const rule2: RuleVersion = {
      id: 'rule_v1_stock_replace',
      ruleId: 'RULE_STOCK_REPLACE',
      storeId: store2.id,
      name: 'Out-of-Stock Item Replacement Opportunity',
      description: 'Triggers when an abandoned cart contains a recently out-of-stock item, recommending an instant upgrade or alternative in-stock SKU.',
      ruleType: 'EDGE',
      version: 1,
      isActive: true,
      priorityWeight: 30,
      conditionField: 'cart.itemCount',
      operator: 'GTE',
      thresholdValue: 1,
      createdAt: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(),
      createdBy: 'Merchant Admin'
    };
    const rule3: RuleVersion = {
      id: 'rule_v1_cart_age_window',
      ruleId: 'RULE_CART_AGE_WINDOW',
      storeId: store1.id,
      name: 'Optimal 2-24 Hour Recovery Window',
      description: 'Triggers when cart abandonment duration is within the sweet spot where customer conversion intent remains warm.',
      ruleType: 'CORE',
      version: 1,
      isActive: true,
      priorityWeight: 20,
      conditionField: 'cart.ageHours',
      operator: 'GTE',
      thresholdValue: 2,
      createdAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(),
      createdBy: 'System Engine'
    };

    this.ruleVersions.set(rule1.id, rule1);
    this.ruleVersions.set(rule2.id, rule2);
    this.ruleVersions.set(rule3.id, rule3);

    // 6. Evidence Snapshots & Recommendations
    const rulesFired1: RuleExecution[] = [
      { ruleId: rule1.ruleId, ruleName: rule1.name, ruleType: 'CORE', version: 1, fired: true, weight: 35, explanation: 'Cart value ($1,240.00) exceeds high-value threshold of $500.00.', actualValue: 1240, thresholdValue: 500 },
      { ruleId: rule3.ruleId, ruleName: rule3.name, ruleType: 'CORE', version: 1, fired: true, weight: 20, explanation: 'Cart abandoned 2 hours ago (within optimal recovery window).', actualValue: 2, thresholdValue: 2 },
      { ruleId: 'RULE_VIP_STATUS', ruleName: 'VIP Lifetime Value Tier', ruleType: 'CORE', version: 1, fired: true, weight: 25, explanation: 'Customer Sarah Jenkins is a Top Tier VIP with 6 past orders totaling $3,450.00.', actualValue: 'VIP', thresholdValue: 'VIP' }
    ];

    const snap1: EvidenceSnapshot = {
      snapshotId: 'snap_01_sarah_cart',
      recommendationId: 'rec_01_sarah_vip',
      cartId: cart1.id,
      evaluatedAt: twoHoursAgo,
      cartValueAtEval: 1240.00,
      customerTotalSpentAtEval: 3450.00,
      customerTotalOrdersAtEval: 6,
      cartAgeHours: 2,
      itemsSnapshot: cart1.items,
      rulesFired: rulesFired1,
      rawAiReasoning: 'Customer Sarah Jenkins is a Top VIP tier buyer ($3,450 LTV) who abandoned a high-ticket Italian leather handbag ($980) and silk scarf after applying VIP20 discount code. Because she has completed 6 previous high-value orders and the cart age is exactly 2 hours, conversion probability is exceptionally high (96%). A personal white-glove reachout from the founder or senior concierge offering reserved inventory dispatch will recover this $1,240 order immediately.',
      version: 1
    };

    const rec1: Recommendation = {
      id: 'rec_01_sarah_vip',
      storeId: store1.id,
      cartId: cart1.id,
      customerId: cust1.id,
      customerEmail: cust1.email,
      customerName: `${cust1.firstName} ${cust1.lastName}`,
      title: 'VIP Concierge Reachout: Sarah Jenkins ($1,240.00 Handbag & Scarf)',
      reason: 'Top VIP customer ($3,450 LTV) abandoned luxury artisan handbag. Personal SMS/Email from concierge recommended.',
      actionSummary: 'Send personalized VIP email thanking her for her loyalty and offering priority complimentary express shipping on the Milano Leather Handbag.',
      suggestedActionType: 'VIP_PERSONAL_REACHOUT',
      priority: 'Critical',
      status: 'Open',
      confidenceScore: 96,
      opportunityValue: 1240.00,
      recoveryProbability: 75,
      recommendedDiscount: 10,
      currency: 'USD',
      createdAt: twoHoursAgo,
      updatedAt: twoHoursAgo,
      currentEvidenceSnapshotId: snap1.snapshotId,
      evidenceHistory: [snap1],
      rulesFiredCount: 3,
      auditHistory: [
        { id: 'audit_01', storeId: store1.id, entityId: 'rec_01_sarah_vip', entityType: 'RECOMMENDATION', action: 'RECOMMENDATION_CREATED', actor: 'AI_ENGINE', newStatus: 'Open', metadata: { confidence: 96, priority: 'Critical' }, timestamp: twoHoursAgo }
      ]
    };

    const rulesFired2: RuleExecution[] = [
      { ruleId: rule2.ruleId, ruleName: rule2.name, ruleType: 'EDGE', version: 1, fired: true, weight: 30, explanation: 'Item AeroTech RTX 4080 Super is currently out of stock.', actualValue: 0, thresholdValue: 1 },
      { ruleId: 'RULE_HIGH_CART_VAL', ruleName: 'High Cart Value Threshold', ruleType: 'CORE', version: 1, fired: true, weight: 20, explanation: 'Cart value (€1,370.00) is above €150 store threshold.', actualValue: 1370, thresholdValue: 150 }
    ];

    const snap2: EvidenceSnapshot = {
      snapshotId: 'snap_02_elena_gpu',
      recommendationId: 'rec_02_elena_gpu',
      cartId: cart2.id,
      evaluatedAt: fourHoursAgo,
      cartValueAtEval: 1370.00,
      customerTotalSpentAtEval: 2100.00,
      customerTotalOrdersAtEval: 4,
      cartAgeHours: 4,
      itemsSnapshot: cart2.items,
      rulesFired: rulesFired2,
      rawAiReasoning: 'Elena Rostova (VIP Tech Enthusiast, €2,100 LTV) abandoned cart containing out-of-stock RTX 4080 Super GPU. Our inventory shows RTX 4080 OC Edition is in stock. Recommending an immediate automated stock replacement offer with a €50 upgrade voucher to preserve this €1,370 cart before she purchases from a competitor.',
      version: 1
    };

    const rec2: Recommendation = {
      id: 'rec_02_elena_gpu',
      storeId: store2.id,
      cartId: cart2.id,
      customerId: cust3.id,
      customerEmail: cust3.email,
      customerName: `${cust3.firstName} ${cust3.lastName}`,
      title: 'Stock Replacement Opportunity: Elena Rostova (€1,370.00 RTX Gaming Setup)',
      reason: 'Cart contains out-of-stock RTX 4080 Super GPU. Suggest offering in-stock RTX 4080 OC Edition alternative.',
      actionSummary: 'Send automated email proposing instant substitution to RTX 4080 OC Edition with complimentary overnight delivery.',
      suggestedActionType: 'STOCK_REPLACEMENT',
      priority: 'High',
      status: 'Open',
      confidenceScore: 88,
      opportunityValue: 1370.00,
      recoveryProbability: 85,
      recommendedDiscount: 50,
      currency: 'EUR',
      createdAt: fourHoursAgo,
      updatedAt: fourHoursAgo,
      currentEvidenceSnapshotId: snap2.snapshotId,
      evidenceHistory: [snap2],
      rulesFiredCount: 2,
      auditHistory: [
        { id: 'audit_02', storeId: store2.id, entityId: 'rec_02_elena_gpu', entityType: 'RECOMMENDATION', action: 'RECOMMENDATION_CREATED', actor: 'AI_ENGINE', newStatus: 'Open', metadata: { confidence: 88, priority: 'High' }, timestamp: fourHoursAgo }
      ]
    };

    const rulesFired3: RuleExecution[] = [
      { ruleId: rule3.ruleId, ruleName: rule3.name, ruleType: 'CORE', version: 1, fired: true, weight: 20, explanation: 'Cart age is 12 hours (optimal recovery window).', actualValue: 12, thresholdValue: 2 }
    ];

    const snap3: EvidenceSnapshot = {
      snapshotId: 'snap_03_marcus_jacket',
      recommendationId: 'rec_03_marcus_jacket',
      cartId: cart3.id,
      evaluatedAt: twelveHoursAgo,
      cartValueAtEval: 320.00,
      customerTotalSpentAtEval: 120.00,
      customerTotalOrdersAtEval: 1,
      cartAgeHours: 12,
      itemsSnapshot: cart3.items,
      rulesFired: rulesFired3,
      rawAiReasoning: 'Marcus Vance has 1 previous order and abandoned a $320 Amalfi Linen Blazer 12 hours ago. He previously engaged with discount campaigns. Offering a time-sensitive 10% recovery code with a 24-hour expiration will trigger conversion.',
      version: 1
    };

    const rec3: Recommendation = {
      id: 'rec_03_marcus_jacket',
      storeId: store1.id,
      cartId: cart3.id,
      customerId: cust2.id,
      customerEmail: cust2.email,
      customerName: `${cust2.firstName} ${cust2.lastName}`,
      title: 'Discount Recovery: Marcus Vance ($320.00 Tailored Amalfi Blazer)',
      reason: '12-hour abandoned cart from repeat buyer who responds strongly to promotional incentives.',
      actionSummary: 'Trigger automated 10% recovery discount code with a countdown timer via Shopify Klaviyo/email integration.',
      suggestedActionType: 'DISCOUNT_RECOVERY',
      priority: 'Medium',
      status: 'Open',
      confidenceScore: 78,
      opportunityValue: 320.00,
      recoveryProbability: 75,
      recommendedDiscount: 10,
      currency: 'USD',
      createdAt: twelveHoursAgo,
      updatedAt: twelveHoursAgo,
      currentEvidenceSnapshotId: snap3.snapshotId,
      evidenceHistory: [snap3],
      rulesFiredCount: 1,
      auditHistory: [
        { id: 'audit_03', storeId: store1.id, entityId: 'rec_03_marcus_jacket', entityType: 'RECOMMENDATION', action: 'RECOMMENDATION_CREATED', actor: 'AI_ENGINE', newStatus: 'Open', metadata: { confidence: 78, priority: 'Medium' }, timestamp: twelveHoursAgo }
      ]
    };

    this.recommendations.set(rec1.id, rec1);
    this.recommendations.set(rec2.id, rec2);
    this.recommendations.set(rec3.id, rec3);

    this.evidenceSnapshots.set(snap1.snapshotId, snap1);
    this.evidenceSnapshots.set(snap2.snapshotId, snap2);
    this.evidenceSnapshots.set(snap3.snapshotId, snap3);

    // 7. Audit logs
    this.auditLogs.push(
      ...rec1.auditHistory,
      ...rec2.auditHistory,
      ...rec3.auditHistory,
      { id: 'audit_init_1', storeId: store1.id, entityId: store1.id, entityType: 'CONFIG', action: 'STORE_INITIALIZED_WITH_ENTERPRISE_RULES', actor: 'SYSTEM_BOOT', timestamp: now.toISOString() }
    );

    // 8. Notifications
    this.notifications.set('notif_1', {
      id: 'notif_1',
      storeId: store1.id,
      title: 'Critical Opportunity Detected: $1,240 VIP Cart',
      message: 'Top VIP customer Sarah Jenkins abandoned a Milano Artisan Handbag 2 hours ago. 96% AI conversion confidence.',
      type: 'CRITICAL_RECOMMENDATION',
      isRead: false,
      linkToId: rec1.id,
      createdAt: twoHoursAgo
    });
    this.notifications.set('notif_2', {
      id: 'notif_2',
      storeId: store2.id,
      title: 'High Opportunity: €1,370 Out-of-Stock Replacement',
      message: 'Elena Rostova abandoned an RTX 4080 Super cart. In-stock RTX 4080 OC replacement recommended.',
      type: 'CRITICAL_RECOMMENDATION',
      isRead: false,
      linkToId: rec2.id,
      createdAt: fourHoursAgo
    });
  }

  // ==========================================
  // STORE METHODS
  // ==========================================
  public async getStores(): Promise<Store[]> {
  const result = await pool.query(
    `SELECT * FROM stores ORDER BY installed_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    shopifyDomain: row.shopify_domain,
    storeName: row.store_name,
    ownerEmail: row.owner_email,
    currency: row.currency,
    installedAt: row.installed_at.toISOString(),
    isActive: row.is_active,
    accessToken: row.access_token,
    activePlan: row.active_plan
  }));
}

  public async getStoreById(id: string): Promise<Store | undefined> {
  const result = await pool.query(
    `SELECT * FROM stores WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    shopifyDomain: row.shopify_domain,
    storeName: row.store_name,
    ownerEmail: row.owner_email,
    currency: row.currency,
    installedAt: row.installed_at.toISOString(),
    isActive: row.is_active,
    accessToken: row.access_token,
    activePlan: row.active_plan
  };
}

  public async getStoreByDomain(domain: string): Promise<Store | undefined> {
  const result = await pool.query(
    `SELECT * FROM stores WHERE shopify_domain = $1 LIMIT 1`,
    [domain]
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    shopifyDomain: row.shopify_domain,
    storeName: row.store_name,
    ownerEmail: row.owner_email,
    currency: row.currency,
    installedAt: row.installed_at.toISOString(),
    isActive: row.is_active,
    accessToken: row.access_token,
    activePlan: row.active_plan
  };
}

  public async saveStore(store: Store): Promise<Store> {
  console.log("SAVE STORE DEBUG");
  console.log(store);
  await pool.query(
  `
    INSERT INTO stores (
      id,
      shopify_domain,
      store_name,
      owner_email,
      owner_name,
      currency,
      installed_at,
      is_active,
      access_token,
      active_plan
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id)
    DO UPDATE SET
      shopify_domain = EXCLUDED.shopify_domain,
      store_name = EXCLUDED.store_name,
      owner_email = EXCLUDED.owner_email,
      owner_name = EXCLUDED.owner_name,      
      currency = EXCLUDED.currency,
      installed_at = EXCLUDED.installed_at,
      is_active = EXCLUDED.is_active,
      access_token = EXCLUDED.access_token,
      active_plan = EXCLUDED.active_plan
    `,
    [
      store.id,
      store.shopifyDomain,
      store.storeName,
      store.ownerEmail,
      store.ownerName || 'Shopify Merchant',
      store.currency,
      store.installedAt,
      store.isActive,
      store.accessToken ?? null,
      store.activePlan
    ]
  );

await this.logAudit({
    storeId: store.id,
    entityId: store.id,
    entityType: 'AUTH',
    action: 'STORE_SAVED_OR_UPDATED',
    actor: 'MERCHANT_ADMIN'
  });

  return store;
}

    // ==========================================
  // BILLING SUBSCRIPTION METHODS
  // ==========================================

  public async updateSubscription(storeId: string, data: Partial<Store>): Promise<Store> {
    const store = await this.getStoreById(storeId);

    if (!store) {
      throw new Error('Store not found');
    }

    const updatedStore: Store = {
      ...store,
      ...data
    };

    this.stores.set(storeId, updatedStore);

    await pool.query(
      `
      UPDATE stores
      SET
        subscription_id = $1,
        subscription_status = $2,
        plan_name = $3,
        billing_approved = $4,
        trial_ends_at = $5,
        current_period_end = $6,
        plan_activated_at = $7,
        recommendations_used = $8,
        recommendations_limit = $9,
        month_start = $10,
        month_end = $11
      WHERE id = $12
      `,
      [
        updatedStore.subscriptionId ?? null,
        updatedStore.subscriptionStatus ?? null,
        updatedStore.planName ?? null,
        updatedStore.billingApproved ?? false,
        updatedStore.trialEndsAt ?? null,
        updatedStore.currentPeriodEnd ?? null,
        updatedStore.planActivatedAt ?? null,
        updatedStore.recommendationsUsed ?? 0,
        updatedStore.recommendationsLimit ?? 300,
        updatedStore.monthStart ?? null,
        updatedStore.monthEnd ?? null,
        storeId
      ]
    );

    return updatedStore;
  }

  public async incrementUsage(storeId: string, count: number = 1): Promise<void> {
    const store = await this.getStoreById(storeId);

    if (!store) {
      throw new Error('Store not found');
    }

    store.recommendationsUsed =
      (store.recommendationsUsed ?? 0) + count;

    this.stores.set(storeId, store);

    await pool.query(
      `
      UPDATE stores
      SET recommendations_used = $1
      WHERE id = $2
      `,
      [
        store.recommendationsUsed,
        storeId
      ]
    );
  }

  public async resetMonthlyUsage(
    storeId: string,
    monthStart: string,
    monthEnd: string
  ): Promise<void> {

    const store = await this.getStoreById(storeId);

    if (!store) {
      throw new Error('Store not found');
    }

    store.recommendationsUsed = 0;
    store.monthStart = monthStart;
    store.monthEnd = monthEnd;

    this.stores.set(storeId, store);

    await pool.query(
      `
      UPDATE stores
      SET
        recommendations_used = 0,
        month_start = $1,
        month_end = $2
      WHERE id = $3
      `,
      [
        monthStart,
        monthEnd,
        storeId
      ]
    );
  }
  // STORE CONFIG METHODS
  // ==========================================
  public getStoreConfig(storeId: string): StoreConfig {
    let conf = this.configs.get(storeId);
    if (!conf) {
      conf = {
        storeId,
        minCartValueThreshold: 100,
        abandonedTimeoutMinutes: 60,
        autoSnoozeDays: 7,
        enableDailyEmailDigest: true,
        enableCriticalEmailAlerts: true,
        enableInAppAlerts: true,
        notificationEmail: 'admin@store.com',
        currencySymbol: '$',
        updatedAt: new Date().toISOString()
      };
      this.configs.set(storeId, conf);
    }
    return conf;
  }

  public async updateStoreConfig(storeId: string, updates: Partial<StoreConfig>, actor: string = 'MERCHANT_USER'): StoreConfig {
    const current = this.getStoreConfig(storeId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.configs.set(storeId, updated);
   await this.logAudit({
      storeId,
      entityId: storeId,
      entityType: 'CONFIG',
      action: 'CONFIG_UPDATED',
      actor,
      metadata: updates
    });
    return updated;
  }

  // ==========================================
  // CUSTOMER METHODS
  // ==========================================
  public getCustomers(storeId: string): Customer[] {
    return Array.from(this.customers.values()).filter(c => c.storeId === storeId);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  public getCustomerByShopifyId(storeId: string, shopifyCustomerId: string): Customer | undefined {
    return Array.from(this.customers.values()).find(c => c.storeId === storeId && c.shopifyCustomerId === shopifyCustomerId);
  }

public async saveCustomer(customer: Customer): Promise<Customer> {
  await pool.query(
    `
    INSERT INTO customers (
      id,
      store_id,
      shopify_customer_id,
      email,
      first_name,
      last_name,
      total_orders,
      total_spent,
      is_vip,
      tags
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (store_id, shopify_customer_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      total_orders = EXCLUDED.total_orders,
      total_spent = EXCLUDED.total_spent,
      is_vip = EXCLUDED.is_vip,
      tags = EXCLUDED.tags
    `,
    [
      customer.id || crypto.randomUUID(),
      customer.storeId,
      customer.shopifyCustomerId,
      customer.email,
      customer.firstName,
      customer.lastName,
      customer.totalOrders,
      customer.totalSpent,
      customer.isVIP,
      customer.tags || []
    ]
  );

  return customer;
}

  // ==========================================
  // CART METHODS
  // ==========================================
  public getCarts(storeId: string): Cart[] {
    return Array.from(this.carts.values()).filter(c => c.storeId === storeId);
  }

  public getCartById(id: string): Cart | undefined {
    return this.carts.get(id);
  }

  public getCartByShopifyId(storeId: string, shopifyCartId: string): Cart | undefined {
    return Array.from(this.carts.values()).find(c => c.storeId === storeId && c.shopifyCartId === shopifyCartId);
  }

  public async saveCart(cart: Cart): Promise<Cart> {

  this.carts.set(cart.id, cart);

  await pool.query(
    `
    INSERT INTO carts (
      id,
      store_id,
      shopify_cart_id,
      customer_id,
      customer_email,
      items,
      total_value,
      currency,
      status,
abandoned_at,
created_at,
updated_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (id)
    DO UPDATE SET
      customer_email = EXCLUDED.customer_email,
      items = EXCLUDED.items,
      total_value = EXCLUDED.total_value,
      status = EXCLUDED.status
    `,
    [
     cart.id,
     cart.storeId,
     cart.shopifyCartId,
     cart.customerId ?? null,
     cart.customerEmail ?? null,
     JSON.stringify(cart.items),
     cart.totalValue,
     cart.currency,
     cart.status,
     cart.abandonedAt,
     cart.createdAt,
     cart.updatedAt
]
  );

 await this.logAudit({
    storeId: cart.storeId,
    entityId: cart.id,
    entityType: 'WEBHOOK',
    action: 'CART_UPDATED_OR_CREATED',
    actor: 'SHOPIFY_WEBHOOK',
    metadata: {
      totalValue: cart.totalValue,
      status: cart.status
    }
  });

  return cart;
}

  // ==========================================
  // RECOMMENDATIONS METHODS (One active per cart!)
  // ==========================================
  public getRecommendations(storeId: string): Recommendation[] {
    return Array.from(this.recommendations.values()).filter(r => r.storeId === storeId);
  }

  public getRecommendationById(id: string): Recommendation | undefined {
    return this.recommendations.get(id);
  }

  public getActiveRecommendationByCartId(cartId: string): Recommendation | undefined {
    return Array.from(this.recommendations.values()).find(r => 
      r.cartId === cartId && r.status !== 'Archived' && r.status !== 'Completed' && r.status !== 'Expired'
    );
  }

  public async saveRecommendation(rec: Recommendation, actor: string = 'AI_ENGINE', actionName: string = 'RECOMMENDATION_UPDATED'): Promise<Recommendation> {
await pool.query(
`
INSERT INTO recommendations (
id,
store_id,
cart_id,
customer_id,
priority,
status,
action_title,
action_description,
suggested_discount_value,
confidence_score,
rules_fired,
ai_explanation,
evidence_history,
created_at,
updated_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
ON CONFLICT (id)
DO UPDATE SET
status = EXCLUDED.status,
action_title = EXCLUDED.action_title,
action_description = EXCLUDED.action_description,
confidence_score = EXCLUDED.confidence_score,
ai_explanation = EXCLUDED.ai_explanation,
updated_at = EXCLUDED.updated_at
`,
[
rec.id,
rec.storeId,
rec.cartId,
rec.customerId ?? null,
rec.priority,
rec.status,
rec.title,
rec.actionSummary,
rec.recommendedDiscount,
rec.confidenceScore,
rec.rulesFiredCount,
rec.reason,
JSON.stringify(rec.evidenceHistory),
rec.createdAt,
rec.updatedAt
]
);
        if (actionName === 'RECOMMENDATION_CREATED') {
      const store = this.stores.get(rec.storeId);

      if (store) {
        const used = store.recommendationsUsed ?? 0;
        const limit = store.recommendationsLimit ?? 300;

        if (used >= limit) {
          throw new Error('Recommendation limit reached for current plan');
        }

        store.recommendationsUsed = used + 1;
        this.stores.set(store.id, store);
      }
    }
    
    // Constraint: One active recommendation per cart
    const existingActive = this.getActiveRecommendationByCartId(rec.cartId);
    if (existingActive && existingActive.id !== rec.id) {
      existingActive.status = 'Updated';
      existingActive.updatedAt = new Date().toISOString();
      this.recommendations.set(existingActive.id, existingActive);
    }

    const prev = this.recommendations.get(rec.id);
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storeId: rec.storeId,
      entityId: rec.id,
      entityType: 'RECOMMENDATION',
      action: actionName,
      actor,
      previousStatus: prev?.status,
      newStatus: rec.status,
      timestamp: new Date().toISOString()
    };

    rec.auditHistory.push(auditEntry);
    this.auditLogs.push(auditEntry);
    this.recommendations.set(rec.id, rec);

    // If critical or high, create alert if not exists
    if ((rec.priority === 'Critical' || rec.priority === 'High') && actionName === 'RECOMMENDATION_CREATED') {
      const alertId = `notif_${Date.now()}`;
      this.notifications.set(alertId, {
        id: alertId,
        storeId: rec.storeId,
        title: `Opportunity Detected (${rec.priority}): ${rec.title}`,
        message: `${rec.reason} — ${rec.confidenceScore}% AI Confidence. Opportunity: ${rec.currency === 'USD' ? '$' : rec.currency === 'EUR' ? '€' : '£'}${rec.opportunityValue.toFixed(2)}`,
        type: 'CRITICAL_RECOMMENDATION',
        isRead: false,
        linkToId: rec.id,
        createdAt: new Date().toISOString()
      });
    }

    return rec;
  }

  // ==========================================
  // IMMUTABLE EVIDENCE SNAPSHOTS
  // ==========================================
  public async saveEvidenceSnapshot(snapshot: EvidenceSnapshot): Promise<EvidenceSnapshot> {

  await pool.query(
    `
    INSERT INTO evidence_snapshots (
      id,
      recommendation_id,
      store_id,
      cart_id,
      snapshot_data,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO NOTHING
    `,
    [
      snapshot.snapshotId,
      snapshot.recommendationId,
      snapshot.storeId,
      snapshot.cartId,
      JSON.stringify(snapshot),
      snapshot.evaluatedAt
    ]
  );

  this.evidenceSnapshots.set(snapshot.snapshotId, snapshot);

  return snapshot;
}

  public getEvidenceBySnapshotId(id: string): EvidenceSnapshot | undefined {
    return this.evidenceSnapshots.get(id);
  }

  public getEvidenceHistoryForRecommendation(recId: string): EvidenceSnapshot[] {
    return Array.from(this.evidenceSnapshots.values())
      .filter(e => e.recommendationId === recId)
      .sort((a, b) => b.version - a.version);
  }

  // ==========================================
  // RULE VERSIONS METHODS
  // ==========================================
  public getRuleVersions(storeId: string): RuleVersion[] {
    return Array.from(this.ruleVersions.values()).filter(r => r.storeId === storeId);
  }

  public getActiveRules(storeId: string): RuleVersion[] {
    return this.getRuleVersions(storeId).filter(r => r.isActive);
  }

  public async saveRuleVersion(rule: RuleVersion, actor: string = 'MERCHANT_ADMIN'): Promise<RuleVersion> {
    this.ruleVersions.set(rule.id, rule);
   await this.logAudit({
      storeId: rule.storeId,
      entityId: rule.id,
      entityType: 'RULE',
      action: `RULE_${rule.isActive ? 'ENABLED' : 'DISABLED'}_OR_UPDATED (v${rule.version})`,
      actor,
      metadata: { name: rule.name, operator: rule.operator, threshold: rule.thresholdValue }
    });
    return rule;
  }

  // ==========================================
  // AUDIT LOGS METHODS (Immutable Append-Only)
  // ==========================================
  public getAuditLogs(storeId: string, limit: number = 100): AuditLogEntry[] {
    return this.auditLogs
      .filter(l => l.storeId === storeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
await pool.query(
`
INSERT INTO audit_logs (
id,
store_id,
actor_id,
actor_name,
actor_role,
action,
resource_type,
resource_id,
timestamp
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
`,
[
fullEntry.id,
fullEntry.storeId,
fullEntry.actor,
fullEntry.actor,
fullEntry.actor,
fullEntry.action,
fullEntry.entityType,
fullEntry.entityId,
fullEntry.timestamp
]
);
    this.auditLogs.push(fullEntry);
  }

  // ==========================================
  // FEEDBACK METHODS
  // ==========================================
  public async saveFeedback(feedback: MerchantFeedback): Promise<MerchantFeedback> {
    this.feedback.set(feedback.id, feedback);
   await this.logAudit({
      storeId: feedback.storeId,
      entityId: feedback.recommendationId,
      entityType: 'RECOMMENDATION',
      action: `FEEDBACK_SUBMITTED (${feedback.isUseful ? 'USEFUL' : 'NOT_USEFUL'})`,
      actor: 'MERCHANT_USER',
      metadata: { comments: feedback.comments }
    });
    return feedback;
  }

  public getFeedbackForStore(storeId: string): MerchantFeedback[] {
    return Array.from(this.feedback.values()).filter(f => f.storeId === storeId);
  }

  // ==========================================
  // NOTIFICATIONS METHODS
  // ==========================================
  public getNotifications(storeId: string): NotificationAlert[] {
    return Array.from(this.notifications.values())
      .filter(n => n.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.isRead = true;
      this.notifications.set(id, notif);
    }
  }

  public markAllNotificationsAsRead(storeId: string): void {
    for (const notif of this.notifications.values()) {
      if (notif.storeId === storeId) {
        notif.isRead = true;
        this.notifications.set(notif.id, notif);
      }
    }
  }

  // ==========================================
  // BILLING PLANS & SUBSCRIPTIONS
  // ==========================================
  public getBillingPlans(): BillingPlan[] {
    return Array.from(this.billingPlans.values());
  }

  public async switchPlan(
  storeId: string,
  planId: 'Launch' | 'Growth' | 'Pro'
): Promise<Store> {
    const store = await this.getStoreById(storeId);
    if (!store) throw new Error('Store not found');
    const oldPlan = store.activePlan;
    store.activePlan = planId;
   await this.logAudit({
      storeId,
      entityId: storeId,
      entityType: 'BILLING',
      action: 'BILLING_PLAN_CHANGED',
      actor: 'MERCHANT_ADMIN',
      previousStatus: oldPlan,
      newStatus: planId,
      metadata: { newPlan: planId }
    });
    return store;
  }
  // ==========================================
  // SHOPIFY PRODUCTS
  // ==========================================

  public products: any[] = [];
  public orders: any[] = [];
  public inventories: any[] = [];

  public async saveProduct(product: any): Promise<any> {
  await pool.query(
    `
    INSERT INTO products
    (
      id,
      store_id,
      shopify_product_id,
      title,
      status,
      total_inventory
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (store_id, shopify_product_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      status = EXCLUDED.status,
      total_inventory = EXCLUDED.total_inventory
    `,
    [
      crypto.randomUUID(),
      product.storeId,
      product.shopifyId,
      product.title,
      product.status,
      product.inventory
    ]
  );

  return product;
}

  public async getProducts(storeId: string): Promise<any[]> {
    return this.products.filter(
      (p) => p.storeId === storeId
    );
  }


  // ==========================================
  // SHOPIFY ORDERS
  // ==========================================

  public async saveOrder(order: any): Promise<any> {
  await pool.query(
    `
    INSERT INTO orders
    (
      id,
      store_id,
      shopify_order_id,
      customer_email,
      total_price,
      currency,
      order_status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (store_id, shopify_order_id)
    DO UPDATE SET
      customer_email = EXCLUDED.customer_email,
      total_price = EXCLUDED.total_price,
      currency = EXCLUDED.currency,
      order_status = EXCLUDED.order_status
    `,
    [
      crypto.randomUUID(),
      order.storeId,
      order.shopifyOrderId,
      order.customerEmail || null,
      order.totalPrice,
      order.currency || 'USD',
      order.orderStatus || 'OPEN'
    ]
  );

  return order;
}

  public async getOrders(storeId: string): Promise<any[]> {
    return this.orders.filter(
      (o) => o.storeId === storeId
    );
  }


  // ==========================================
  // SHOPIFY INVENTORY
  // ==========================================

  public async saveInventory(item: any): Promise<any> {
  await pool.query(
    `
    INSERT INTO inventory (
      id,
      store_id,
      shopify_variant_id,
      product_title,
      inventory_quantity
    )
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (store_id, shopify_variant_id)
    DO UPDATE SET
      product_title = EXCLUDED.product_title,
      inventory_quantity = EXCLUDED.inventory_quantity
    `,
    [
      crypto.randomUUID(),
      item.storeId,
      item.variantId,
      item.productTitle,
      item.quantity
    ]
  );

  return item;
}

  public async getInventory(storeId: string): Promise<any[]> {
    return this.inventories.filter(
      (i) => i.storeId === storeId
    );
   }
}
export const db = new DatabaseEngine();
