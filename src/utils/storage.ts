// storage.ts
// Utility functions for persisting and retrieving data from localStorage.
// This handles budgets, shopping plan optimizations, and manual shopping entries.

import { ShoppingEntry, OptimizationResult } from '../types';

// Keys used in localStorage to avoid magic strings
const STORAGE_KEYS = {
  WEEKLY_BUDGET: 'dunnes_weekly_budget',
  SHOPPING_PLAN: 'dunnes_shopping_plan',
  MANUAL_ENTRIES: 'dunnes_manual_entries'
};

/**
 * Save the user's weekly grocery budget.
 * @param budget - The weekly budget amount.
 */
export function saveWeeklyBudget(budget: number): void {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_BUDGET, budget.toString());
}

/**
 * Retrieve the saved weekly budget from storage.
 * @returns The budget as a number, or null if none is saved.
 */
export function getWeeklyBudget(): number | null {
  const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_BUDGET);
  return saved ? parseFloat(saved) : null;
}

/**
 * Save an optimized shopping plan (with entries & coupon details).
 * Dates are converted to ISO strings since localStorage only supports strings.
 * @param result - The shopping plan result to store.
 */
export function saveShoppingPlan(result: OptimizationResult): void {
  const serializable = {
    ...result,
    entries: result.entries.map(entry => ({
      ...entry,
      date: entry.date.toISOString(),
      couponEarned: entry.couponEarned ? {
        ...entry.couponEarned,
        earnedDate: entry.couponEarned.earnedDate.toISOString(),
        validFrom: entry.couponEarned.validFrom.toISOString(),
        validUntil: entry.couponEarned.validUntil.toISOString(),
        usedDate: entry.couponEarned.usedDate?.toISOString()
      } : undefined,
      couponUsed: entry.couponUsed ? {
        ...entry.couponUsed,
        earnedDate: entry.couponUsed.earnedDate.toISOString(),
        validFrom: entry.couponUsed.validFrom.toISOString(),
        validUntil: entry.couponUsed.validUntil.toISOString(),
        usedDate: entry.couponUsed.usedDate?.toISOString()
      } : undefined
    }))
  };
  localStorage.setItem(STORAGE_KEYS.SHOPPING_PLAN, JSON.stringify(serializable));
}

/**
 * Retrieve the saved shopping plan and rehydrate date objects.
 * Converts ISO strings back to real Date instances.
 * @returns The stored OptimizationResult, or null if none found/invalid.
 */
export function getShoppingPlan(): OptimizationResult | null {
  const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING_PLAN);
  if (!saved) return null;
  
  try {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      entries: parsed.entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        couponEarned: entry.couponEarned ? {
          ...entry.couponEarned,
          earnedDate: new Date(entry.couponEarned.earnedDate),
          validFrom: new Date(entry.couponEarned.validFrom),
          validUntil: new Date(entry.couponEarned.validUntil),
          usedDate: entry.couponEarned.usedDate ? new Date(entry.couponEarned.usedDate) : undefined
        } : undefined,
        couponUsed: entry.couponUsed ? {
          ...entry.couponUsed,
          earnedDate: new Date(entry.couponUsed.earnedDate),
          validFrom: new Date(entry.couponUsed.validFrom),
          validUntil: new Date(entry.couponUsed.validUntil),
          usedDate: entry.couponUsed.usedDate ? new Date(entry.couponUsed.usedDate) : undefined
        } : undefined
      }))
    };
  } catch {
    return null;
  }
}

/**
 * Completely clear all app-related data from storage.
 * This wipes budget, shopping plan, and manual entries.
 */
export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
