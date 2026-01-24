'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MacroForm } from '@/components/macro/MacroForm';
import { MacroProgressBar } from '@/components/macro/MacroProgressBar';
import { MacroChart } from '@/components/macro/MacroChart';
import { Button } from '@/components/ui/Button';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/stores/settingsStore';

interface MacroLog {
  id: number;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string | null;
}

interface MacroStats {
  count: number;
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  period: string;
}

export default function MacrosPage() {
  const [todaysMacros, setTodaysMacros] = useState<MacroLog | null>(null);
  const [recentMacros, setRecentMacros] = useState<MacroLog[]>([]);
  const [stats, setStats] = useState<MacroStats | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7days' | '30days'>('7days');
  const [loading, setLoading] = useState(true);

  // Get targets from settings store
  const { macroTargets: targets } = useSettingsStore();

  useEffect(() => {
    fetchData();
  }, [chartPeriod]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch today's macros
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayResponse = await fetch(`/api/macros/${today}`);
      const todayResult = await todayResponse.json();
      if (todayResult.success) {
        setTodaysMacros(todayResult.data);
      }

      // Fetch recent macros for chart
      const startDate = format(
        subDays(new Date(), chartPeriod === '7days' ? 7 : 30),
        'yyyy-MM-dd'
      );
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const recentResponse = await fetch(
        `/api/macros?startDate=${startDate}&endDate=${endDate}`
      );
      const recentResult = await recentResponse.json();
      if (recentResult.success) {
        setRecentMacros(recentResult.data);
      }

      // Fetch stats
      const statsResponse = await fetch(`/api/macros/stats?period=${chartPeriod}`);
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error fetching macro data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleMacroSaved() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Macro Tracking</h1>
        <Link href="/macros/history">
          <Button variant="secondary">View History</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <MacroForm
              initialData={todaysMacros ? {
                calories: todaysMacros.calories,
                protein: todaysMacros.protein,
                carbs: todaysMacros.carbs,
                fats: todaysMacros.fats,
                notes: todaysMacros.notes || undefined
              } : undefined}
              onSuccess={handleMacroSaved}
            />
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {todaysMacros ? (
              <>
                <MacroProgressBar
                  label="Calories"
                  current={todaysMacros.calories}
                  target={targets.calories}
                  unit="cal"
                  color="purple"
                />
                <MacroProgressBar
                  label="Protein"
                  current={todaysMacros.protein}
                  target={targets.protein}
                  unit="g"
                  color="red"
                />
                <MacroProgressBar
                  label="Carbs"
                  current={todaysMacros.carbs}
                  target={targets.carbs}
                  unit="g"
                  color="blue"
                />
                <MacroProgressBar
                  label="Fats"
                  current={todaysMacros.fats}
                  target={targets.fats}
                  unit="g"
                  color="yellow"
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No macros logged for today yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Fill out the form to track your progress.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      {stats && stats.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {chartPeriod === '7days' ? 'Last 7 Days' : 'Last 30 Days'} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Days Logged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.count}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.averages.calories}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {targets.calories}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Protein</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.averages.protein}g
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {targets.protein}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Carbs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.averages.carbs}g
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {targets.carbs}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Fats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.averages.fats}g
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Target: {targets.fats}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Macro Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Macro Trends</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('7days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '7days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartPeriod('30days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '30days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MacroChart data={recentMacros} targets={targets} />
        </CardContent>
      </Card>
    </div>
  );
}
