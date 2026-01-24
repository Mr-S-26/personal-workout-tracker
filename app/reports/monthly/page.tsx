'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/report/StatCard';
import { VolumeChart } from '@/components/report/VolumeChart';
import { format, subMonths, addMonths } from 'date-fns';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/stores/settingsStore';

interface MonthlyReport {
  period: {
    start: string;
    end: string;
    label: string;
  };
  workouts: {
    total: number;
    totalSets: number;
    totalVolume: number;
    totalDuration: number;
    avgDuration: number;
    workoutDays: number;
    consistencyRate: number;
    change: number;
    volumeChange: number;
  };
  macros: {
    daysLogged: number;
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    complianceRate: number;
    calorieChange: number;
  };
  personalRecords: Array<{
    id: number;
    exerciseName: string;
    weight: number;
    reps: number;
    date: Date;
  }>;
  weeklyBreakdown: Array<{
    weekStart: string;
    weekEnd: string;
    label: string;
    workouts: number;
    volume: number;
    avgCalories: number;
  }>;
  topExercises: Array<{
    name: string;
    volume: number;
    count: number;
  }>;
  exerciseFrequency: Array<{
    name: string;
    count: number;
  }>;
}

export default function MonthlyReportPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { macroTargets } = useSettingsStore();

  useEffect(() => {
    fetchReport();
  }, [currentDate]);

  async function fetchReport() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/monthly?date=${format(currentDate, 'yyyy-MM-dd')}`
      );
      const result = await response.json();

      if (result.success) {
        setReport(result.data);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePreviousMonth() {
    setCurrentDate((prev) => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setCurrentDate((prev) => addMonths(prev, 1));
  }

  function handleThisMonth() {
    setCurrentDate(new Date());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Failed to load report</div>
      </div>
    );
  }

  const macroAdherence = report.macros.daysLogged > 0
    ? Math.round((report.macros.avgCalories / macroTargets.calories) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Monthly Report</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{report.period.label}</p>
        </div>
        <Link href="/reports">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <Button onClick={handlePreviousMonth} variant="secondary">
            Previous Month
          </Button>
          <Button onClick={handleThisMonth} variant="secondary" size="sm">
            This Month
          </Button>
          <Button onClick={handleNextMonth} variant="secondary">
            Next Month
          </Button>
        </CardContent>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Workouts"
          value={report.workouts.total}
          change={report.workouts.change}
          icon="💪"
          subtitle={`${report.workouts.workoutDays} unique days`}
        />
        <StatCard
          label="Total Volume"
          value={`${report.workouts.totalVolume.toLocaleString()} lbs`}
          change={report.workouts.volumeChange}
          icon="🏋️"
        />
        <StatCard
          label="Consistency Rate"
          value={`${report.workouts.consistencyRate}%`}
          icon="📈"
          subtitle={`${report.workouts.workoutDays} workout days`}
        />
        <StatCard
          label="Total Time"
          value={`${Math.round(report.workouts.totalDuration / 60)} hrs`}
          icon="⏱️"
          subtitle={`Avg ${report.workouts.avgDuration} min/workout`}
        />
      </div>

      {/* Macro Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Macro Tracking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Days Logged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.macros.daysLogged}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(report.macros.complianceRate)}% compliance
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Calories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.macros.avgCalories || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {macroTargets.calories}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Protein</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.macros.avgProtein || 0}g
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {macroTargets.protein}g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Carbs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.macros.avgCarbs || 0}g
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {macroTargets.carbs}g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Fats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.macros.avgFats || 0}g
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {macroTargets.fats}g
              </p>
            </div>
          </div>
          {report.macros.daysLogged > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calorie adherence: <span className="font-medium">{macroAdherence}%</span> of target
                {report.macros.calorieChange !== 0 && (
                  <span className="ml-2">
                    ({report.macros.calorieChange > 0 ? '+' : ''}
                    {report.macros.calorieChange} vs last month)
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <VolumeChart
            data={report.weeklyBreakdown.map((week) => ({
              label: week.label,
              volume: week.volume,
              workouts: week.workouts,
              calories: week.avgCalories,
            }))}
            type="weekly"
          />
        </CardContent>
      </Card>

      {/* Personal Records */}
      {report.personalRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Records This Month 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{pr.exerciseName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(pr.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {pr.weight} lbs × {pr.reps}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Exercises by Volume */}
        {report.topExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Exercises by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.topExercises.map((exercise, index) => (
                  <div key={exercise.name} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {exercise.count} times
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {exercise.volume.toLocaleString()} lbs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Most Frequent Exercises */}
        {report.exerciseFrequency.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Most Frequent Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.exerciseFrequency.map((exercise, index) => (
                  <div key={exercise.name} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{exercise.name}</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{
                            width: `${(exercise.count / report.exerciseFrequency[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {exercise.count}x
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
