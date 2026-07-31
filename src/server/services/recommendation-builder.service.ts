import type {
  Recommendation,
  RecommendationPriority
} from '../../types.ts';

export class RecommendationBuilder {

  buildPriority(score: number): RecommendationPriority {

    if (score >= 85) return 'Critical';

    if (score >= 70) return 'High';

    if (score < 50) return 'Low';

    return 'Medium';
  }
  
   buildActionType(cart: any, customer: any): Recommendation['suggestedActionType'] {

  if (customer?.isVIP && cart.totalValue >= 400) {
    return 'VIP_PERSONAL_REACHOUT';
  }

  if (cart.items.some((i: any) => !i.inStock)) {
    return 'STOCK_REPLACEMENT';
  }

  if (cart.items.length >= 3) {
    return 'BUNDLE_UPSELL';
  }

  return 'DISCOUNT_RECOVERY';
}
  }

export const recommendationBuilder = new RecommendationBuilder();
