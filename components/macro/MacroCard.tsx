'use client';

import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface MacroCardProps {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string | null;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  onDelete?: () => void;
}

export function MacroCard({
  date,
  calories,
  protein,
  carbs,
  fats,
  notes,
  targets,
  onDelete,
}: MacroCardProps) {
  const getMacroColor = (value: number, target?: number) => {
    if (!target) return 'text-gray-900 dark:text-gray-100';

    const percentage = (value / target) * 100;
    if (percentage >= 95 && percentage <= 105) {
      return 'text-green-600 dark:text-green-400';
    } else if (percentage >= 85 && percentage <= 115) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  const getCalorieColor = (value: number, target?: number) => {
    if (!target) return 'text-gray-900 dark:text-gray-100';

    const percentage = (value / target) * 100;
    if (percentage >= 95 && percentage <= 105) {
      return 'text-green-600 dark:text-green-400';
    } else if (percentage >= 90 && percentage <= 110) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardTitle>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Calories */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
            <p className={`text-2xl font-bold ${getCalorieColor(calories, targets?.calories)}`}>
              {calories}
            </p>
            {targets && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {targets.calories}
              </p>
            )}
          </div>

          {/* Protein */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
            <p className={`text-2xl font-bold ${getMacroColor(protein, targets?.protein)}`}>
              {protein}g
            </p>
            {targets && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {targets.protein}g
              </p>
            )}
          </div>

          {/* Carbs */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
            <p className={`text-2xl font-bold ${getMacroColor(carbs, targets?.carbs)}`}>
              {carbs}g
            </p>
            {targets && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {targets.carbs}g
              </p>
            )}
          </div>

          {/* Fats */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fats</p>
            <p className={`text-2xl font-bold ${getMacroColor(fats, targets?.fats)}`}>
              {fats}g
            </p>
            {targets && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {targets.fats}g
              </p>
            )}
          </div>
        </div>

        {/* Macro Breakdown Bar */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Macro Breakdown</p>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div
              className="bg-red-500"
              style={{
                width: `${((protein * 4) / calories) * 100}%`,
              }}
              title={`Protein: ${Math.round(((protein * 4) / calories) * 100)}%`}
            />
            <div
              className="bg-blue-500"
              style={{
                width: `${((carbs * 4) / calories) * 100}%`,
              }}
              title={`Carbs: ${Math.round(((carbs * 4) / calories) * 100)}%`}
            />
            <div
              className="bg-yellow-500"
              style={{
                width: `${((fats * 9) / calories) * 100}%`,
              }}
              title={`Fats: ${Math.round(((fats * 9) / calories) * 100)}%`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Protein: {Math.round(((protein * 4) / calories) * 100)}%</span>
            <span>Carbs: {Math.round(((carbs * 4) / calories) * 100)}%</span>
            <span>Fats: {Math.round(((fats * 9) / calories) * 100)}%</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
