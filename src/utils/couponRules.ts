import { Coupon } from '../types';

/**
 * Defines the rules for Dunnes coupons.
 * - "small" coupon: €5 off €25 (valid for 7 days, but effectively 6 full days after next-day activation)
 * - "large" coupon: €10 off €50 (valid for 14 days, but effectively 13 full days after next-day activation)
 */
export const COUPON_RULES = {
  small: {
    minSpend: 25,         // Minimum spend to earn this coupon
    maxSpend: 49.99,      // Upper cap (since >=50 triggers large coupon instead)
    couponValue: 5,       // Value of discount (€5)
    minUseSpend: 25,      // Minimum spend required to redeem this coupon
    validDays: 6          // Number of days coupon is valid (after next-day activation)
  },
  large: {
    minSpend: 50,         // Minimum spend to earn this coupon
    couponValue: 10,      // Value of discount (€10)
    minUseSpend: 50,      // Minimum spend required to redeem this coupon
    validDays: 9         // Valid for 10 days total (next-day activation + 9 more days)
  }
};

/**
 * Determines which coupon (if any) the customer earns based on spend amount.
 * @param spendAmount - Amount spent in a single transaction
 * @param earnedDate - Date of the purchase
 * @returns Coupon object (small/large) or null if no coupon earned
 */
export function getCouponEarned(spendAmount: number, earnedDate: Date): Coupon | null {
  if (spendAmount >= COUPON_RULES.large.minSpend) {
    return createCoupon('large', earnedDate);
  } else if (spendAmount >= COUPON_RULES.small.minSpend) {
    return createCoupon('small', earnedDate);
  }
  return null; // No coupon earned if spend < €25
}

/**
 * Creates a coupon object with proper validity dates.
 * @param type - "small" (€5 off €25) or "large" (€10 off €50)
 * @param earnedDate - Date coupon was earned
 * @returns Coupon object
 */
export function createCoupon(type: 'small' | 'large', earnedDate: Date): Coupon {
  const rules = COUPON_RULES[type];

  // Coupons become valid the next day
  const validFrom = new Date(earnedDate);
  validFrom.setDate(validFrom.getDate() + 1);

  // Expiration date = validFrom + validDays
  const validUntil = new Date(validFrom);
  validUntil.setDate(validUntil.getDate() + rules.validDays);

  return {
    id: `${type}-${earnedDate.getTime()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
    type,
    value: rules.couponValue,
    minSpend: rules.minUseSpend,
    earnedDate,
    validFrom,
    validUntil,
    used: false
  };
}

/**
 * Checks if a coupon can be used for a given purchase.
 * @param coupon - Coupon object
 * @param spendAmount - Current spend amount
 * @param date - Date of purchase
 * @returns true if coupon can be applied, false otherwise
 */
export function canUseCoupon(coupon: Coupon, spendAmount: number, date: Date): boolean {
  return !coupon.used && 
         spendAmount >= coupon.minSpend && 
         date >= coupon.validFrom && 
         date <= coupon.validUntil;
}

/**
 * Checks if a coupon is expired.
 * @param coupon - Coupon object
 * @param currentDate - Current date
 * @returns true if coupon is expired, false otherwise
 */
export function isCouponExpired(coupon: Coupon, currentDate: Date): boolean {
  return currentDate > coupon.validUntil;
}
