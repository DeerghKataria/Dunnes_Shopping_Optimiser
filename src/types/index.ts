export interface Coupon {
  id: string;
  type: 'small' | 'large'; // small = €5 off €25, large = €10 off €50
  value: number;
  minSpend: number;
  earnedDate: Date;
  validFrom: Date;
  validUntil: Date;
  used: boolean;
  usedDate?: Date;
}

export interface ShoppingEntry {
  id: string;
  date: Date;
  plannedAmount: number;
  actualAmount?: number;
  couponEarned?: Coupon;
  couponUsed?: Coupon;
  savings: number;
  status: 'planned' | 'completed' | 'missed';
}

export interface OptimizationResult {
  entries: ShoppingEntry[];
  totalSpend: number;
  totalSavings: number;
  missedSavings: number;
  couponsEarned: number;
  couponsUsed: number;
}