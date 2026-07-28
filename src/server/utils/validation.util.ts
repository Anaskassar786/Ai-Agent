/**
 * PROFIT TOOL — Schema Validation Utilities
 * Implements input validation and sanitization for rule evaluations,
 * discount codes, and API payloads (Document 13B).
 */

import { z } from 'zod';

export const RuleCreationSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters").max(100),
  description: z.string().min(5, "Description must be at least 5 characters"),
  conditionField: z.string().min(2, "Condition field is required"),
  operator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'IN', 'CONTAINS']),
  thresholdValue: z.string().min(1, "Threshold value is required"),
  weight: z.number().int().min(1).max(100)
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  storeId: z.string().min(1, "Store ID is required")
});

export class ValidationUtils {
  public static validateRulePayload(data: unknown) {
    return RuleCreationSchema.safeParse(data);
  }

  public static validateLoginPayload(data: unknown) {
    return LoginRequestSchema.safeParse(data);
  }

  public static sanitizeString(input: string): string {
    return input.replace(/[<>]/g, '').trim();
  }

  public static isValidDiscountCode(code: string): boolean {
    // Discount codes should be uppercase alphanumeric with optional hyphens/underscores
    const regex = /^[A-Z0-9-_]{3,30}$/;
    return regex.test(code);
  }
}
