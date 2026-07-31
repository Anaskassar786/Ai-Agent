import type { Cart, Customer } from '../../types.ts';

export class GeminiTriggerService {
  shouldRun(cart: Cart, customer: Customer | null, confidence: number): boolean {

    if (confidence >= 90) return true;

    if (customer?.isVIP) return true;

    if (cart.totalValue >= 500) return true;

    return false;
  }
}

export const geminiTriggerService = new GeminiTriggerService();

