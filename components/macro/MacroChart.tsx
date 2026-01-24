'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface MacroLog {
  id: number;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroChartProps {
  data: MacroLog[];
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

type MacroType = 'calories' | 'protein' | 'carbs' | 'fats';

export function MacroChart({ data, targets }: MacroChartProps) {
  const [selectedMacros, setSelectedMacros] = useState<Set<MacroType>>(
    new Set(['calories', 'protein', 'carbs', 'fats'])
  );

  const chartData = data
    .map((log) => ({
      date: format(new Date(log.date), 'MMM dd'),
      fullDate: format(new Date(log.date), 'yyyy-MM-dd'),
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fats: log.fats,
      caloriesTarget: targets?.calories,
      proteinTarget: targets?.protein,
      carbsTarget: targets?.carbs,
      fatsTarget: targets?.fats,
    }))
    .reverse(); // Reverse to show chronological order

  const toggleMacro = (macro: MacroType) => {
    const newSelected = new Set(selectedMacros);
    if (newSelected.has(macro)) {
      newSelected.delete(macro);
    } else {
      newSelected.add(macro);
    }
    setSelectedMacros(newSelected);
  };

  const macroConfig = {
    calories: { color: '#8b5cf6', label: 'Calories' },
    protein: { color: '#ef4444', label: 'Protein (g)' },
    carbs: { color: '#3b82f6', label: 'Carbs (g)' },
    fats: { color: '#eab308', label: 'Fats (g)' },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No macro data available for the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend / Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(macroConfig) as MacroType[]).map((macro) => (
          <button
            key={macro}
            onClick={() => toggleMacro(macro)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMacros.has(macro)
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            style={
              selectedMacros.has(macro)
                ? { backgroundColor: macroConfig[macro].color }
                : {}
            }
          >
            {macroConfig[macro].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
          />
          <Legend />

          {/* Actual Values */}
          {selectedMacros.has('calories') && (
            <Line
              type="monotone"
              dataKey="calories"
              stroke={macroConfig.calories.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Calories"
            />
          )}
          {selectedMacros.has('protein') && (
            <Line
              type="monotone"
              dataKey="protein"
              stroke={macroConfig.protein.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Protein (g)"
            />
          )}
          {selectedMacros.has('carbs') && (
            <Line
              type="monotone"
              dataKey="carbs"
              stroke={macroConfig.carbs.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Carbs (g)"
            />
          )}
          {selectedMacros.has('fats') && (
            <Line
              type="monotone"
              dataKey="fats"
              stroke={macroConfig.fats.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Fats (g)"
            />
          )}

          {/* Target Lines (dashed) */}
          {targets && selectedMacros.has('calories') && (
            <Line
              type="monotone"
              dataKey="caloriesTarget"
              stroke={macroConfig.calories.color}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Calorie Target"
            />
          )}
          {targets && selectedMacros.has('protein') && (
            <Line
              type="monotone"
              dataKey="proteinTarget"
              stroke={macroConfig.protein.color}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Protein Target"
            />
          )}
          {targets && selectedMacros.has('carbs') && (
            <Line
              type="monotone"
              dataKey="carbsTarget"
              stroke={macroConfig.carbs.color}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Carbs Target"
            />
          )}
          {targets && selectedMacros.has('fats') && (
            <Line
              type="monotone"
              dataKey="fatsTarget"
              stroke={macroConfig.fats.color}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Fats Target"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {(Object.keys(macroConfig) as MacroType[]).map((macro) => {
            const values = chartData.map((d) => d[macro] as number);
            const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            const min = Math.min(...values);
            const max = Math.max(...values);

            return (
              <div key={macro} className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {macroConfig[macro].label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Avg: {avg}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Min: {min} | Max: {max}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
