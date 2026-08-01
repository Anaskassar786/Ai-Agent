import type { Cart, Customer, RuleExecution } from '../../types.ts';

export class LocalAIEngine {

  calculateConfidenceScore(
    cart: Cart,
    customer: Customer | null,
    rulesFired: RuleExecution[]
  ): number {

    let score = 40;

    score += rulesFired.reduce((sum, rule) => sum + rule.weight, 0);

    if (cart.totalValue >= 500) score += 20;
    else if (cart.totalValue >= 250) score += 10;

    if (customer?.isVIP) score += 20;

    if ((customer?.totalOrders ?? 0) >= 3) score += 10;

    const cartAgeHours = Math.max(
      1,
      Math.round(
        (Date.now() - new Date(cart.abandonedAt).getTime()) /
        (1000 * 60 * 60)
      )
    );

    if (cartAgeHours >= 2) score += 5;
    if (cartAgeHours >= 6) score += 5;

    return Math.min(99, Math.max(30, score));
  }
}

export const localAIEngine = new LocalAIEngine();
