import { ShoppingEntry, Coupon, OptimizationResult } from '../types';
import { getCouponEarned, canUseCoupon, createCoupon } from './couponRules';

/**
 * Generates an optimized shopping plan over ~10 weeks
 * based on a weekly budget and Dunnes coupon rules.
 */
export function optimizeShoppingPlan(weeklyBudget: number, startDate: Date = new Date()): OptimizationResult {
  const entries: ShoppingEntry[] = [];
  const activeCoupons: Coupon[] = [];
  let totalSpend = 0;
  let totalSavings = 0;
  let missedSavings = 0;
  let couponsEarned = 0;
  let couponsUsed = 0;

  // Total planned budget = 10 weeks of shopping
  const totalBudget = weeklyBudget * 10;
  let entryId = 0;
  
  // Loop through 10 weeks (max 2 shops per week for realism)
  for (let week = 0; week < 10; week++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (week * 7));
    
    const weeklyAmount = Math.min(weeklyBudget, totalBudget - totalSpend);
    if (weeklyAmount <= 0) break;
    
    const shopsThisWeek = determineOptimalShopsPerWeek(weeklyAmount);
    
    for (let shopInWeek = 0; shopInWeek < shopsThisWeek; shopInWeek++) {
      const entryDate = new Date(weekStartDate);
      // Spread shops across the week (e.g., Mon + Thu if 2 shops)
      const dayOffset = shopInWeek === 0 ? 0 : Math.floor(6 / (shopsThisWeek - 1)) * shopInWeek;
      entryDate.setDate(weekStartDate.getDate() + dayOffset);
      
      // Remove expired coupons (missed savings if not used)
      const expiredCoupons = activeCoupons.filter(c => entryDate > c.validUntil && !c.used);
      expiredCoupons.forEach(c => {
        missedSavings += c.value;
        const index = activeCoupons.indexOf(c);
        activeCoupons.splice(index, 1);
      });
      
      // Find best coupon to use (prioritize higher value, then earlier expiry)
      const usableCoupons = activeCoupons
        .filter(c => !c.used && entryDate >= c.validFrom && entryDate <= c.validUntil)
        .sort((a, b) => {
          if (a.value !== b.value) return b.value - a.value;
          return a.validUntil.getTime() - b.validUntil.getTime();
        });
      
      // Plan spend amount for this shop
      const remainingBudget = totalBudget - totalSpend;
      const remainingWeeklyAmount = weeklyAmount - (entries.filter(e => 
        e.date >= weekStartDate && e.date < new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      ).reduce((sum, e) => sum + e.plannedAmount, 0));
      
      let plannedAmount = remainingWeeklyAmount / (shopsThisWeek - shopInWeek);
      let couponUsed: Coupon | undefined;
      let savings = 0;
      
      // Try to apply the best available coupon
      if (usableCoupons.length > 0) {
        const bestCoupon = usableCoupons[0];
        if (plannedAmount >= bestCoupon.minSpend) {
          couponUsed = bestCoupon;
          savings = bestCoupon.value;
          plannedAmount = Math.max(plannedAmount, bestCoupon.minSpend);
          bestCoupon.used = true;
          bestCoupon.usedDate = entryDate;
          couponsUsed++;
        }
      }
      
      // Adjust spend to maximize coupon earnings (e.g. round up to €25/€50 thresholds)
      plannedAmount = optimizeSpendForCoupon(plannedAmount, remainingBudget);
      plannedAmount = Math.min(plannedAmount, remainingBudget); // don’t overspend budget
      
      // Earn new coupon if spend qualifies
      const couponEarned = getCouponEarned(plannedAmount, entryDate);
      if (couponEarned) {
        activeCoupons.push(couponEarned);
        couponsEarned++;
      }
      
      // Create and record this shopping entry
      const entry: ShoppingEntry = {
        id: `entry-${entryId++}`,
        date: entryDate,
        plannedAmount: Math.round(plannedAmount * 100) / 100,
        couponEarned,
        couponUsed,
        savings,
        status: 'planned'
      };
      
      entries.push(entry);
      totalSpend += plannedAmount;
      totalSavings += savings;
      
      if (totalSpend >= totalBudget) break;
    }
    
    if (totalSpend >= totalBudget) break;
  }
  
  return {
    entries,
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    missedSavings: Math.round(missedSavings * 100) / 100,
    couponsEarned,
    couponsUsed
  };
}

/**
 * Decide how many shops per week based on weekly budget.
 * - Large budgets → split into 2 shops for more coupon opportunities.
 * - Max 2 shops/week for realism.
 */
function determineOptimalShopsPerWeek(weeklyBudget: number): number {
  if (weeklyBudget >= 100) {
    return 2;
  } else if (weeklyBudget >= 75) {
    return weeklyBudget >= 90 ? 2 : 1;
  }
  return 1;
}

/**
 * Adjust spend to hit coupon thresholds when possible.
 * Example: if plannedAmount = €48 → bump to €50 to get €10 off.
 */
function optimizeSpendForCoupon(plannedAmount: number, remainingBudget: number): number {
  if (plannedAmount >= 45 && plannedAmount < 50 && remainingBudget >= 50) {
    return 50;
  }
  if (plannedAmount >= 50) {
    return Math.max(50, plannedAmount);
  }
  if (plannedAmount >= 20 && plannedAmount < 25 && remainingBudget >= 25) {
    return 25;
  }
  if (plannedAmount >= 25 && plannedAmount < 50) {
    return Math.min(49.99, plannedAmount);
  }
  return plannedAmount;
}
