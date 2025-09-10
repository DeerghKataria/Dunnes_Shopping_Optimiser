import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { OptimizationResult } from '../types';

interface SavingsSummaryProps {
  result: OptimizationResult;
}

/**
 * SavingsSummary Component
 * 
 * Displays a summary of optimization results including:
 * - Total spend, total savings, missed savings
 * - Coupon efficiency and usage
 * - Helpful tips based on performance
 */
export default function SavingsSummary({ result }: SavingsSummaryProps) {
  // % of total spend that was saved
  const savingsRate = result.totalSpend > 0 ? (result.totalSavings / result.totalSpend) * 100 : 0;
  // % of earned coupons that were actually used
  const efficiency = result.couponsEarned > 0 ? (result.couponsUsed / result.couponsEarned) * 100 : 0;

  // Stats cards shown in the grid
  const stats = [
    {
      label: 'Total Spend',
      value: `€${result.totalSpend.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      label: 'Total Savings',
      value: `€${result.totalSavings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Missed Savings',
      value: `€${result.missedSavings.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Coupon Efficiency',
      value: `${efficiency.toFixed(0)}%`,
      icon: Target,
      color: 'text-dunnes-green',
      bgColor: 'bg-dunnes-cream'
    }
  ];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-dunnes-gold rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Savings Summary</h2>
          <p className="text-sm text-gray-600">Your optimization results</p>
        </div>
      </div>

      {/* Stats Grid (Spend, Savings, Missed, Efficiency) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 mx-auto ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Extra details & tips */}
      <div className="space-y-4">
        {/* Overall savings rate */}
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-sm font-medium text-green-800">Savings Rate</span>
          <span className="text-lg font-bold text-green-800">{savingsRate.toFixed(1)}%</span>
        </div>

        {/* Coupon stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Coupons Earned:</span>
            <span className="font-semibold">{result.couponsEarned}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Coupons Used:</span>
            <span className="font-semibold">{result.couponsUsed}</span>
          </div>
        </div>

        {/* Conditional optimization tips */}
        {result.missedSavings > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>Optimization Tip:</strong> You have €{result.missedSavings.toFixed(2)} in missed savings from expired coupons. 
              Try to use coupons closer to their expiry dates for maximum benefit!
            </p>
          </div>
        )}

        {/* Praise if efficiency is excellent */}
        {efficiency >= 80 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Excellent!</strong> You're using {efficiency.toFixed(0)}% of your earned coupons. Keep up the great optimization!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
