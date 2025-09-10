import React, { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, Trash2 } from 'lucide-react';
import BudgetInput from './components/BudgetInput';
import ShoppingCalendar from './components/ShoppingCalendar';
import CalendarView from './components/CalendarView';
import CouponTracker from './components/CouponTracker';
import SavingsSummary from './components/SavingsSummary';
import { OptimizationResult, Coupon } from './types';
import { optimizeShoppingPlan } from './utils/optimizer';
import { saveWeeklyBudget, getWeeklyBudget, saveShoppingPlan, getShoppingPlan, clearStorage } from './utils/storage';

function App() {
  const [weeklyBudget, setWeeklyBudget] = useState<number | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedBudget = getWeeklyBudget();
    const savedPlan = getShoppingPlan();
    
    if (savedBudget) {
      setWeeklyBudget(savedBudget);
    }
    
    if (savedPlan) {
      setOptimizationResult(savedPlan);
    }
  }, []);

  const handleBudgetSet = async (budget: number) => {
    setLoading(true);
    setWeeklyBudget(budget);
    saveWeeklyBudget(budget);
    
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = optimizeShoppingPlan(budget);
    setOptimizationResult(result);
    saveShoppingPlan(result);
    setLoading(false);
  };

  const handleRegeneratePlan = async () => {
    if (!weeklyBudget) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = optimizeShoppingPlan(weeklyBudget);
    setOptimizationResult(result);
    saveShoppingPlan(result);
    setLoading(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearStorage();
      setWeeklyBudget(null);
      setOptimizationResult(null);
    }
  };

  const getAllCoupons = (): Coupon[] => {
    if (!optimizationResult) return [];
    
    const coupons: Coupon[] = [];
    
    optimizationResult.entries.forEach(entry => {
      if (entry.couponEarned) {
        coupons.push(entry.couponEarned);
      }
    });
    
    return coupons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dunnes-green rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dunnes-green">Dunnes Grocery Optimizer</h1>
                <p className="text-sm text-gray-600">Maximize your coupon savings at Dunnes Stores</p>
              </div>
            </div>
            
            {optimizationResult && (
              <div className="flex gap-2">
                <button
                  onClick={handleRegeneratePlan}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
                <button
                  onClick={handleClearData}
                  className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Budget Input */}
          <BudgetInput
            initialBudget={weeklyBudget || undefined}
            onBudgetSet={handleBudgetSet}
            loading={loading}
          />

          {/* Results */}
          {optimizationResult && (
            <>
              {/* Savings Summary */}
              <SavingsSummary result={optimizationResult} />

              {/* Calendar View */}
              <CalendarView entries={optimizationResult.entries} />

              {/* Shopping Calendar and Coupon Tracker */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ShoppingCalendar entries={optimizationResult.entries} />
                <CouponTracker coupons={getAllCoupons()} />
              </div>
            </>
          )}

          {/* Loading State */}
          {loading && !optimizationResult && (
            <div className="card">
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-dunnes-green animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Your Optimal Plan</h3>
                <p className="text-gray-600">
                  Analyzing coupon cycles and maximizing your savings...
                </p>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!weeklyBudget && !loading && (
            <div className="card text-center">
              <div className="max-w-2xl mx-auto">
                <ShoppingBag className="w-16 h-16 text-dunnes-green mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome to Dunnes Grocery Optimizer
                </h3>
                <p className="text-gray-600 mb-6">
                  Get the most out of Dunnes Stores' coupon system. Enter your weekly budget above 
                  and we'll create an intelligent 10-week shopping plan that maximizes your savings 
                  through strategic coupon earning and usage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">€5 Coupon</h4>
                    <p className="text-sm text-green-700">
                      Spend €25-€49.99 to earn a €5 off €25+ coupon (valid 6 days)
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">€10 Coupon</h4>
                    <p className="text-sm text-blue-700">
                      Spend €50+ to earn a €10 off €50+ coupon (valid 9 days)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Dunnes Grocery Optimizer - Maximize your savings with smart shopping</p>
            <p className="mt-1">Not affiliated with Dunnes Stores. Coupon rules subject to change.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;