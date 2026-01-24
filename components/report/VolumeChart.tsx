'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';

interface VolumeChartProps {
  data: Array<{
    label: string;
    volume: number;
    workouts: number;
    calories?: number | null;
  }>;
  type?: 'daily' | 'weekly';
}

export function VolumeChart({ data, type = 'daily' }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="label"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          yAxisId="left"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
          label={{ value: 'Volume (lbs)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
          label={{ value: 'Workouts', angle: 90, position: 'insideRight' }}
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
        <Bar
          yAxisId="left"
          dataKey="volume"
          fill="#3b82f6"
          name="Volume (lbs)"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="workouts"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Workouts"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
