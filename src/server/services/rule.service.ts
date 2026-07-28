/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Rule Engine Service
 * Supports Core Rules, Edge Rules, Versioned Rules, and rule execution evaluation
 */

import { ruleRepo, configRepo } from '../repositories/index.ts';
import { Cart, Customer, RuleVersion, RuleExecution } from '../../types.ts';

export class RuleService {
  async evaluateCartRules(cart: Cart, customer: Customer | null): Promise<RuleExecution[]> {
    const rules = await ruleRepo.getActiveByStoreId(cart.storeId);
    const config = await configRepo.getByStoreId(cart.storeId);
    const executions: RuleExecution[] = [];

    // Calculate cart age in hours
    const ageHours = (Date.now() - new Date(cart.createdAt).getTime()) / (3600 * 1000);

    // 1. Built-in core threshold rule
    if (cart.totalValue >= config.minCartValueThreshold) {
      executions.push({
        ruleId: 'RULE_CORE_MIN_THRESHOLD',
        ruleName: `Store Minimum Cart Threshold (${config.currencySymbol}${config.minCartValueThreshold})`,
        ruleType: 'CORE',
        version: 1,
        fired: true,
        weight: 15,
        explanation: `Cart value (${config.currencySymbol}${cart.totalValue.toFixed(2)}) meets or exceeds store target of ${config.currencySymbol}${config.minCartValueThreshold}.`,
        actualValue: cart.totalValue,
        thresholdValue: config.minCartValueThreshold
      });
    }

    // 2. VIP customer check
    if (customer && customer.isVIP) {
      executions.push({
        ruleId: 'RULE_CORE_VIP_CUSTOMER',
        ruleName: 'VIP Customer Recognition',
        ruleType: 'CORE',
        version: 1,
        fired: true,
        weight: 25,
        explanation: `Customer ${customer.firstName} ${customer.lastName} is a verified VIP with ${customer.totalOrders} previous orders ($${customer.totalSpent.toFixed(2)} LTV).`,
        actualValue: 'VIP',
        thresholdValue: 'VIP'
      });
    }

    // 3. Out of stock check (Edge rule)
    const hasOutOfStock = cart.items.some(i => !i.inStock);
    if (hasOutOfStock) {
      executions.push({
        ruleId: 'RULE_EDGE_STOCK_REPLACEMENT',
        ruleName: 'Out-of-Stock Item Replacement Opportunity',
        ruleType: 'EDGE',
        version: 1,
        fired: true,
        weight: 30,
        explanation: 'Cart contains an out-of-stock SKU. Offering an immediate in-stock replacement will salvage this order.',
        actualValue: 0,
        thresholdValue: 1
      });
    }

    // 4. Custom versioned rules from database
    for (const rule of rules) {
      let actualVal: any = null;
      if (rule.conditionField === 'cart.totalValue') actualVal = cart.totalValue;
      else if (rule.conditionField === 'customer.totalOrders') actualVal = customer?.totalOrders || 0;
      else if (rule.conditionField === 'cart.ageHours') actualVal = ageHours;
      else if (rule.conditionField === 'customer.isVIP') actualVal = customer?.isVIP || false;
      else if (rule.conditionField === 'cart.itemCount') actualVal = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      else if (rule.conditionField === 'cart.shippingCountry') actualVal = cart.shippingCountry || 'US';

      const fired = this.evaluateCondition(actualVal, rule.operator, rule.thresholdValue);
      if (fired) {
        executions.push({
          ruleId: rule.ruleId,
          ruleName: rule.name,
          ruleType: rule.ruleType,
          version: rule.version,
          fired: true,
          weight: rule.priorityWeight,
          explanation: `${rule.name}: evaluated field ${rule.conditionField} (${actualVal}) ${rule.operator} ${rule.thresholdValue}.`,
          actualValue: actualVal,
          thresholdValue: rule.thresholdValue
        });
      }
    }

    return executions;
  }

  private evaluateCondition(actual: any, operator: string, threshold: any): boolean {
    if (actual === null || actual === undefined) return false;
    const numActual = Number(actual);
    const numThresh = Number(threshold);

    switch (operator) {
      case 'GT': return numActual > numThresh;
      case 'GTE': return numActual >= numThresh;
      case 'LT': return numActual < numThresh;
      case 'LTE': return numActual <= numThresh;
      case 'EQ': return String(actual).toLowerCase() === String(threshold).toLowerCase();
      case 'IN': return String(threshold).split(',').map(s => s.trim().toLowerCase()).includes(String(actual).toLowerCase());
      case 'CONTAINS': return String(actual).toLowerCase().includes(String(threshold).toLowerCase());
      default: return false;
    }
  }

  async saveCustomRule(storeId: string, ruleData: Partial<RuleVersion>, actor: string = 'MERCHANT_ADMIN'): Promise<RuleVersion> {
    const existing = await ruleRepo.getByStoreId(storeId);
    const nextVersion = (existing.find(r => r.ruleId === ruleData.ruleId)?.version || 0) + 1;

    const newRule: RuleVersion = {
      id: `rule_v${nextVersion}_${Date.now()}`,
      ruleId: ruleData.ruleId || `RULE_CUST_${Date.now()}`,
      storeId,
      name: ruleData.name || 'Custom Merchant Rule',
      description: ruleData.description || 'Custom threshold evaluation rule',
      ruleType: ruleData.ruleType || 'CUSTOM',
      version: nextVersion,
      isActive: ruleData.isActive ?? true,
      priorityWeight: ruleData.priorityWeight || 15,
      conditionField: ruleData.conditionField || 'cart.totalValue',
      operator: ruleData.operator || 'GTE',
      thresholdValue: ruleData.thresholdValue || 100,
      createdAt: new Date().toISOString(),
      createdBy: actor
    };

    return ruleRepo.save(newRule, actor);
  }
}

export const ruleService = new RuleService();
