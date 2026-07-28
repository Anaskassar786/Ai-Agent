/**
 * PROFIT TOOL — Enterprise Backend Types & Domain Models
 * Explicit server domain interfaces matching Document 13B specification.
 */

export interface EnterpriseLogContext {
  storeId?: string;
  actorId?: string;
  actorRole?: 'OWNER' | 'STAFF' | 'SYSTEM' | 'AUDIT';
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayloadHeader {
  hmacSha256: string;
  shopDomain: string;
  topic: string;
  apiVersion: string;
}

export interface EvidenceSnapshot {
  snapshotId: string;
  cartId: string;
  evaluatedAt: string;
  rulesEvaluated: Array<{
    ruleId: string;
    ruleName: string;
    conditionField: string;
    operator: string;
    thresholdValue: string;
    actualValue: any;
    passed: boolean;
    weight: number;
  }>;
  selectedRecommendationId: string | null;
  explainabilityText: string;
  cryptographicHash: string;
}

export interface BillingSubscriptionPlan {
  id: string;
  name: string;
  monthlyPriceUsd: number;
  orderVolumeLimit: number;
  features: string[];
  slaSupportLevel: 'Standard' | 'Priority' | 'Dedicated 24/7';
}
