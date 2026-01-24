'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/report/StatCard';
import Link from 'next/link';
import { format } from 'date-fns';

interface QuickStats {
  weeklyReport: {
    workouts: { total: number; totalVolume: number; change: number };
    macros: { daysLogged: number; avgCalories: number };
    personalRecords: number;
  };
  monthlyReport: {
    workouts: { total: number; totalVolume: number; consistencyRate: number };
    macros: { daysLogged: number; complianceRate: number };
    personalRecords: number;
  };
}

export default function ReportsPage() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const [weeklyResponse, monthlyResponse] = await Promise.all([
        fetch(`/api/reports/weekly?date=${format(new Date(), 'yyyy-MM-dd')}`),
        fetch(`/api/reports/monthly?date=${format(new Date(), 'yyyy-MM-dd')}`),
      ]);

      const [weeklyResult, monthlyResult] = await Promise.all([
        weeklyResponse.json(),
        monthlyResponse.json(),
      ]);

      if (weeklyResult.success && monthlyResult.success) {
        setStats({
          weeklyReport: {
            workouts: {
              total: weeklyResult.data.workouts.total,
              totalVolume: weeklyResult.data.workouts.totalVolume,
              change: weeklyResult.data.workouts.change,
            },
            macros: {
              daysLogged: weeklyResult.data.macros.daysLogged,
              avgCalories: weeklyResult.data.macros.avgCalories,
            },
            personalRecords: weeklyResult.data.personalRecords.length,
          },
          monthlyReport: {
            workouts: {
              total: monthlyResult.data.workouts.total,
              totalVolume: monthlyResult.data.workouts.totalVolume,
              consistencyRate: monthlyResult.data.workouts.consistencyRate,
            },
            macros: {
              daysLogged: monthlyResult.data.macros.daysLogged,
              complianceRate: monthlyResult.data.macros.complianceRate,
            },
            personalRecords: monthlyResult.data.personalRecords.length,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View detailed weekly and monthly progress reports
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/reports/weekly">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Weekly Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View your performance over the past 7 days with day-by-day breakdown and comparisons
              </p>
              {stats && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">This week:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {stats.weeklyReport.workouts.total} workouts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total volume:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {stats.weeklyReport.workouts.totalVolume.toLocaleString()} lbs
                    </span>
                  </div>
                  {stats.weeklyReport.personalRecords > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">PRs set:</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        {stats.weeklyReport.personalRecords} 🏆
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button variant="primary" className="w-full mt-4">
                View Weekly Report
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/monthly">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 Monthly Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive monthly analytics with trends, consistency tracking, and top exercises
              </p>
              {stats && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">This month:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {stats.monthlyReport.workouts.total} workouts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Consistency:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {stats.monthlyReport.workouts.consistencyRate}%
                    </span>
                  </div>
                  {stats.monthlyReport.personalRecords > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">PRs set:</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        {stats.monthlyReport.personalRecords} 🏆
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button variant="primary" className="w-full mt-4">
                View Monthly Report
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* This Week Highlights */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>This Week Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Workouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.weeklyReport.workouts.total}
                </p>
                {stats.weeklyReport.workouts.change !== 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.weeklyReport.workouts.change > 0 ? '↑' : '↓'}{' '}
                    {Math.abs(stats.weeklyReport.workouts.change)} vs last week
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(stats.weeklyReport.workouts.totalVolume / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">lbs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Macro Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.weeklyReport.macros.daysLogged}/7
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((stats.weeklyReport.macros.daysLogged / 7) * 100)}% tracked
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personal Records</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.weeklyReport.personalRecords}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">new PRs 🏆</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Month Highlights */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>This Month Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.monthlyReport.workouts.total}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(stats.monthlyReport.workouts.totalVolume / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">lbs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consistency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.monthlyReport.workouts.consistencyRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">workout days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Macro Compliance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.monthlyReport.macros.complianceRate)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.monthlyReport.macros.daysLogged} days logged
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Weekly Reports
              </h3>
              <p>
                Track your week-over-week progress with daily breakdowns, volume trends, macro
                adherence, and personal records. Compare against the previous week to identify
                improvements.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Monthly Reports
              </h3>
              <p>
                Get comprehensive monthly analytics including consistency rates, top exercises by
                volume, exercise frequency, weekly breakdowns, and month-over-month comparisons.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Key Metrics Tracked
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Total workouts and workout days</li>
                <li>Training volume (weight × reps)</li>
                <li>Workout duration and consistency</li>
                <li>Macro adherence and calorie tracking</li>
                <li>Personal records and achievements</li>
                <li>Exercise frequency and volume distribution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
