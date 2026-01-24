'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);

  useEffect(() => {
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch recent workouts
      const workoutsRes = await fetch('/api/workouts?limit=5');
      const workoutsData = await workoutsRes.json();
      if (workoutsData.success) {
        setRecentWorkouts(workoutsData.data);
        calculateStats(workoutsData.data);
      }

      // Fetch recent PRs
      const prsRes = await fetch('/api/personal-records');
      const prsData = await prsRes.json();
      if (prsData.success) {
        setRecentPRs(prsData.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  function calculateStats(workouts: any[]) {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const thisWeekWorkouts = workouts.filter((w) => {
      const workoutDate = new Date(w.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const totalSets = workouts.reduce(
      (sum, w) =>
        sum + w.exercises.reduce((s: number, e: any) => s + e.sets.length, 0),
      0
    );

    const totalVolume = workouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s: number, e: any) =>
            s +
            e.sets.reduce((v: number, set: any) => {
              if (set.completed && set.reps && set.weight) {
                return v + set.reps * set.weight;
              }
              return v;
            }, 0),
          0
        ),
      0
    );

    setStats({
      thisWeek: thisWeekWorkouts.length,
      totalWorkouts: workouts.length,
      totalSets,
      totalVolume: Math.round(totalVolume),
    });
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Welcome to FitTrack
      </h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This Week
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.thisWeek}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                workouts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Workouts
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalWorkouts}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                all time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sets
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalSets}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Volume
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalVolume}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">kg</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/templates">
              <Button variant="primary" className="w-full">
                Choose Template
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View History</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/workouts">
              <Button variant="secondary" className="w-full">
                Past Workouts
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/personal-records">
              <Button variant="secondary" className="w-full">
                View PRs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/macros">
              <Button variant="secondary" className="w-full">
                Track Nutrition
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Workouts</CardTitle>
              <Link href="/workouts">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No workouts yet. Start your first workout!
              </p>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    href={`/workouts/${workout.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {workout.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(workout.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {workout.exercises.length} exercises
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {workout.duration} min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent PRs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent PRs</CardTitle>
              <Link href="/personal-records">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPRs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Complete workouts to start tracking PRs!
              </p>
            ) : (
              <div className="space-y-3">
                {recentPRs.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {pr.exerciseName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(pr.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {pr.weight} kg
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pr.reps} reps
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
