import React, { useState } from 'react';
import { Euro, Calculator } from 'lucide-react'; // Icons for styling (visual feedback)

// Props interface - makes the component reusable and testable
interface BudgetInputProps {
  initialBudget?: number;        // Optional pre-set budget (e.g., from local storage)
  onBudgetSet: (budget: number) => void;  // Callback when user submits a valid budget
  loading?: boolean;             // If true, disables input + shows "Generating Plan..."
}

// Functional component definition
export default function BudgetInput({ initialBudget, onBudgetSet, loading }: BudgetInputProps) {
  // Local state: store user-typed budget as string (so input can be controlled properly)
  const [budget, setBudget] = useState(initialBudget?.toString() || '');
  const [error, setError] = useState(''); // Error message for invalid inputs

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget); // Convert input to number
    
    // Basic input validation
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }
    
    // Lower bound rule (Dunnes coupons make sense only if you spend enough)
    if (budgetNum < 20) {
      setError('Budget should be at least €20 per week');
      return;
    }
    
    // Upper bound guard (avoid unrealistic inputs)
    if (budgetNum > 500) {
      setError('Budget seems too high. Please check the amount');
      return;
    }
    
    // If valid → clear error + send value to parent via callback
    setError('');
    onBudgetSet(budgetNum);
  };

  return (
    <div className="card">
      {/* Header section: icon + title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-dunnes-green rounded-lg flex items-center justify-center">
          <Euro className="w-5 h-5 text-white" /> {/* Green Euro icon */}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Grocery Budget</h2>
          <p className="text-sm text-gray-600">Enter your average weekly grocery spend</p>
        </div>
      </div>
      
      {/* Budget input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Average Weekly Budget (€)
          </label>
          
          {/* Input field with Euro icon inside */}
          <div className="relative">
            <Euro className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)} // Controlled input
              placeholder="110"
              min="20"
              max="500"
              step="0.01"   // allow decimals like €110.50
              className="input-field pl-10" // pl-10 = padding for Euro icon
              required
            />
          </div>

          {/* Validation error messages */}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          {/* Helper text */}
          <p className="mt-2 text-xs text-gray-500">
            This will be used to create an optimal 10-week shopping plan
          </p>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={loading} // Disable while generating
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" /> {/* Calculator icon */}
          {loading ? 'Generating Plan...' : 'Generate Optimal Plan'}
        </button>
      </form>
    </div>
  );
}
