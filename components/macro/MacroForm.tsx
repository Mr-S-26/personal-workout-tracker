'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';

interface MacroFormProps {
  initialDate?: Date;
  initialData?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    notes?: string;
  };
  onSuccess?: () => void;
}

export function MacroForm({ initialDate, initialData, onSuccess }: MacroFormProps) {
  const [date, setDate] = useState(
    initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '');
  const [protein, setProtein] = useState(initialData?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(initialData?.carbs?.toString() || '');
  const [fats, setFats] = useState(initialData?.fats?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing data for selected date
  useEffect(() => {
    if (!initialData) {
      fetchMacrosForDate(date);
    }
  }, [date, initialData]);

  async function fetchMacrosForDate(selectedDate: string) {
    try {
      const response = await fetch(`/api/macros/${selectedDate}`);
      const result = await response.json();

      if (result.success && result.data) {
        setCalories(result.data.calories.toString());
        setProtein(result.data.protein.toString());
        setCarbs(result.data.carbs.toString());
        setFats(result.data.fats.toString());
        setNotes(result.data.notes || '');
      } else {
        // Reset form if no data for this date
        setCalories('');
        setProtein('');
        setCarbs('');
        setFats('');
        setNotes('');
      }
    } catch (err) {
      // If 404, it's okay - just means no data for this date yet
      console.log('No macro data for this date yet');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!calories || !protein || !carbs || !fats) {
      setError('All macro fields are required');
      setLoading(false);
      return;
    }

    const caloriesNum = parseInt(calories);
    const proteinNum = parseFloat(protein);
    const carbsNum = parseFloat(carbs);
    const fatsNum = parseFloat(fats);

    if (isNaN(caloriesNum) || isNaN(proteinNum) || isNaN(carbsNum) || isNaN(fatsNum)) {
      setError('All macro values must be valid numbers');
      setLoading(false);
      return;
    }

    if (caloriesNum < 0 || proteinNum < 0 || carbsNum < 0 || fatsNum < 0) {
      setError('Macro values cannot be negative');
      setLoading(false);
      return;
    }

    // Calculate calories from macros (4 cal/g for protein and carbs, 9 cal/g for fat)
    const calculatedCalories = Math.round(proteinNum * 4 + carbsNum * 4 + fatsNum * 9);
    const calorieDifference = Math.abs(caloriesNum - calculatedCalories);

    // Warn if calorie mismatch is significant (more than 10%)
    if (calorieDifference > calculatedCalories * 0.1) {
      const useCalculated = confirm(
        `Your entered calories (${caloriesNum}) don't match the calculated calories from macros (${calculatedCalories}). Would you like to use the calculated value?`
      );
      if (useCalculated) {
        setCalories(calculatedCalories.toString());
      }
    }

    try {
      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          calories: parseInt(calories),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fats: parseFloat(fats),
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'Failed to save macros');
      }
    } catch (err) {
      setError('Failed to save macros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(preset: 'maintenance' | 'cut' | 'bulk') {
    // Based on workout-routine.md targets
    switch (preset) {
      case 'maintenance':
        setCalories('2450');
        setProtein('152');
        setCarbs('290');
        setFats('65');
        break;
      case 'cut':
        setCalories('2200');
        setProtein('160');
        setCarbs('250');
        setFats('60');
        break;
      case 'bulk':
        setCalories('2700');
        setProtein('170');
        setCarbs('330');
        setFats('70');
        break;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Quick Fill Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleQuickFill('maintenance')}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Maintenance
        </button>
        <button
          type="button"
          onClick={() => handleQuickFill('cut')}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cut
        </button>
        <button
          type="button"
          onClick={() => handleQuickFill('bulk')}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Bulk
        </button>
      </div>

      {/* Macro Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            label="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="2450"
            min="0"
            step="1"
            required
          />
        </div>
        <div>
          <Input
            type="number"
            label="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="152"
            min="0"
            step="0.1"
            required
          />
        </div>
        <div>
          <Input
            type="number"
            label="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="290"
            min="0"
            step="0.1"
            required
          />
        </div>
        <div>
          <Input
            type="number"
            label="Fats (g)"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            placeholder="65"
            min="0"
            step="0.1"
            required
          />
        </div>
      </div>

      {/* Calculated Calories Display */}
      {protein && carbs && fats && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Calculated calories from macros:{' '}
          <span className="font-medium">
            {Math.round(
              parseFloat(protein || '0') * 4 +
                parseFloat(carbs || '0') * 4 +
                parseFloat(fats || '0') * 9
            )}{' '}
            cal
          </span>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about today's nutrition..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            Macros saved successfully!
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Macros'}
      </Button>
    </form>
  );
}
