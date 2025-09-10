import React from 'react';
import { Gift, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Coupon } from '../types';
import { format, isToday, differenceInDays } from 'date-fns';

interface CouponTrackerProps {
  coupons: Coupon[];
}

/**
 * CouponTracker Component
 * 
 * Displays and manages all coupons (active, upcoming, used, expired).
 * Uses icons + colors to clearly represent coupon statuses.
 */
export default function CouponTracker({ coupons }: CouponTrackerProps) {
  const today = new Date();

  // Categorize coupons into different buckets
  const activeCoupons = coupons.filter(c => !c.used && today >= c.validFrom && today <= c.validUntil);
  const upcomingCoupons = coupons.filter(c => !c.used && today < c.validFrom);
  const usedCoupons = coupons.filter(c => c.used);
  const expiredCoupons = coupons.filter(c => !c.used && today > c.validUntil);

  /**
   * Assigns Tailwind color classes based on coupon status
   */
  const getCouponStatusColor = (coupon: Coupon) => {
    if (coupon.used) return 'border-green-300 bg-green-50'; // Used coupon
    if (today > coupon.validUntil) return 'border-red-300 bg-red-50'; // Expired
    if (today < coupon.validFrom) return 'border-blue-300 bg-blue-50'; // Upcoming
    
    const daysLeft = differenceInDays(coupon.validUntil, today);
    if (daysLeft <= 2) return 'border-orange-300 bg-orange-50'; // Expiring soon
    return 'border-green-300 bg-green-50'; // Active & safe
  };

  /**
   * Selects an appropriate icon for each coupon based on its status
   */
  const getCouponIcon = (coupon: Coupon) => {
    if (coupon.used) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (today > coupon.validUntil) return <XCircle className="w-5 h-5 text-red-600" />;
    if (today < coupon.validFrom) return <Clock className="w-5 h-5 text-blue-600" />;
    
    const daysLeft = differenceInDays(coupon.validUntil, today);
    if (daysLeft <= 2) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <Gift className="w-5 h-5 text-green-600" />;
  };

  /**
   * Renders a single coupon card with details like:
   * - Value & min spend
   * - Earned/used/expiry info
   * - Status-based styling
   */
  const renderCouponCard = (coupon: Coupon) => {
    const daysLeft = differenceInDays(coupon.validUntil, today);
    
    return (
      <div
        key={coupon.id}
        className={`border rounded-lg p-4 transition-all duration-200 ${getCouponStatusColor(coupon)}`}
      >
        <div className="flex items-start justify-between">
          {/* Left: Icon + coupon details */}
          <div className="flex items-center gap-3">
            {getCouponIcon(coupon)}
            <div>
              <h4 className="font-semibold text-gray-900">
                €{coupon.value} off €{coupon.minSpend}+ spend
              </h4>
              <p className="text-sm text-gray-600">
                {coupon.type === 'small' ? 'Small' : 'Large'} Coupon
              </p>
            </div>
          </div>
          
          {/* Right: Dates and status messages */}
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Earned: {format(coupon.earnedDate, 'MMM do')}
            </p>
            {coupon.used ? (
              <p className="text-xs text-green-600 font-medium">
                Used: {coupon.usedDate && format(coupon.usedDate, 'MMM do')}
              </p>
            ) : today > coupon.validUntil ? (
              <p className="text-xs text-red-600 font-medium">Expired</p>
            ) : today < coupon.validFrom ? (
              <p className="text-xs text-blue-600 font-medium">
                Active from: {format(coupon.validFrom, 'MMM do')}
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                {daysLeft === 0 ? (
                  <span className="text-orange-600 font-medium">Expires today!</span>
                ) : daysLeft === 1 ? (
                  <span className="text-orange-600 font-medium">Expires tomorrow</span>
                ) : daysLeft <= 2 ? (
                  <span className="text-orange-600 font-medium">Expires in {daysLeft} days</span>
                ) : (
                  `Expires in ${daysLeft} days`
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle case where no coupons exist yet
  if (coupons.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-dunnes-gold rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Coupon Tracker</h2>
            <p className="text-sm text-gray-600">No coupons yet - complete your first shop!</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render categorized coupon sections:
   * - Active
   * - Upcoming
   * - Used
   * - Expired
   */
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-dunnes-gold rounded-lg flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Coupon Tracker</h2>
          <p className="text-sm text-gray-600">Manage your active and upcoming coupons</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Active coupons section */}
        {activeCoupons.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              Active Coupons ({activeCoupons.length})
            </h3>
            <div className="space-y-3">
              {activeCoupons.map(renderCouponCard)}
            </div>
          </div>
        )}

        {/* Upcoming coupons section */}
        {upcomingCoupons.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Upcoming Coupons ({upcomingCoupons.length})
            </h3>
            <div className="space-y-3">
              {upcomingCoupons.map(renderCouponCard)}
            </div>
          </div>
        )}

        {/* Used coupons section (limit 3, show count if more) */}
        {usedCoupons.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Used Coupons ({usedCoupons.length})
            </h3>
            <div className="space-y-3">
              {usedCoupons.slice(0, 3).map(renderCouponCard)}
            </div>
            {usedCoupons.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                And {usedCoupons.length - 3} more used coupons...
              </p>
            )}
          </div>
        )}

        {/* Expired coupons section (limit 2, show count if more) */}
        {expiredCoupons.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Expired Coupons ({expiredCoupons.length})
            </h3>
            <div className="space-y-3">
              {expiredCoupons.slice(0, 2).map(renderCouponCard)}
            </div>
            {expiredCoupons.length > 2 && (
              <p className="text-sm text-gray-500 text-center">
                And {expiredCoupons.length - 2} more expired coupons...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
