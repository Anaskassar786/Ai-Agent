import type { Cart } from '../../types.ts';

export class OpportunityEngine {

  calculateOpportunityValue(cart: Cart): number {
    return cart.totalValue;
  }

  calculateRecoveryProbability(confidence: number): number {

    if (confidence >= 90) return 95;

    if (confidence >= 80) return 85;

    if (confidence >= 70) return 75;

    if (confidence >= 60) return 65;

    return 50;
  }

  recommendDiscount(
    cart: Cart,
    confidence: number
  ): number {

    if (confidence >= 90) return 5;

    if (cart.totalValue >= 500) return 10;

    if (cart.totalValue >= 250) return 12;

    return 15;
  }

}

export const opportunityEngine =
  new OpportunityEngine();
