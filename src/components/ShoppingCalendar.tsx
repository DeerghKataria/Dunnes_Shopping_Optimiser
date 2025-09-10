import React from 'react';
import { Calendar, ShoppingCart, Gift, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ShoppingEntry } from '../types';
import { format, isToday, isPast } from 'date-fns';

interface ShoppingCalendarProps {
  entries: ShoppingEntry[];
  onEntryUpdate?: (entryId: string, actualAmount: number) => void;
}

export default function ShoppingCalendar({ entries, onEntryUpdate }: ShoppingCalendarProps) {
  /**
   * Utility: Decides which background & border color to apply
   * based on the shopping entry's status and date relative to today.
   */
  const getEntryStatusColor = (entry: ShoppingEntry) => {
    const today = new Date();
    
    if (entry.status === 'completed') return 'bg-green-100 border-green-300';
    if (entry.status === 'missed') return 'bg-red-100 border-red-300';
    if (isPast(entry.date) && entry.status === 'planned') return 'bg-orange-100 border-orange-300';
    if (isToday(entry.date)) return 'bg-blue-100 border-blue-300';
    return 'bg-white border-gray-200';
  };

  /**
   * Utility: Returns the correct status icon component
   * for each shopping entry, using Lucide icons.
   */
  const getStatusIcon = (entry: ShoppingEntry) => {
    if (entry.status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (entry.status === 'missed') return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (isPast(entry.date) && entry.status === 'planned') return <Clock className="w-5 h-5 text-orange-600" />;
    if (isToday(entry.date)) return <Calendar className="w-5 h-5 text-blue-600" />;
    return <Calendar className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="card">
      {/* Header section with icon + title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-dunnes-lightgreen rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Shopping Calendar</h2>
          <p className="text-sm text-gray-600">Your optimized 10-week plan</p>
        </div>
      </div>

      {/* List of shopping entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getEntryStatusColor(entry)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Entry title with status icon and date */}
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(entry)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Shopping Trip #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(entry.date, 'EEEE, MMMM do, yyyy')}
                      {isToday(entry.date) && <span className="ml-2 text-blue-600 font-medium">(Today)</span>}
                    </p>
                  </div>
                </div>

                {/* Key details about this trip: planned spend, coupons, savings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  {/* Planned spend */}
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Planned Spend</p>
                      <p className="font-semibold text-gray-900">€{entry.plannedAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Coupon used (if any) */}
                  {entry.couponUsed && (
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-dunnes-gold" />
                      <div>
                        <p className="text-xs text-gray-500">Coupon Used</p>
                        <p className="font-semibold text-dunnes-gold">-€{entry.couponUsed.value}</p>
                      </div>
                    </div>
                  )}

                  {/* Coupon earned (if any) */}
                  {entry.couponEarned && (
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Coupon Earned</p>
                        <p className="font-semibold text-green-600">
                          €{entry.couponEarned.value} off €{entry.couponEarned.minSpend}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Savings (if any) */}
                  {entry.savings > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Savings</p>
                        <p className="font-semibold text-green-600">€{entry.savings.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlighted coupon details (if earned) */}
                {entry.couponEarned && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Coupon Earned:</strong> €{entry.couponEarned.value} off €{entry.couponEarned.minSpend}+ spend
                      <br />
                      <span className="text-xs">
                        Valid: {format(entry.couponEarned.validFrom, 'MMM do')} - {format(entry.couponEarned.validUntil, 'MMM do')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
