'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface PR {
  id: number;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  workoutId?: number | null;
}

export default function PersonalRecordsPage() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'exercise' | 'date'>('exercise');

  useEffect(() => {
    fetchPRs();
  }, []);

  async function fetchPRs() {
    try {
      const response = await fetch('/api/personal-records');
      const result = await response.json();
      if (result.success) {
        setPrs(result.data);
      }
    } catch (error) {
      console.error('Error fetching PRs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Loading...
        </h1>
      </div>
    );
  }

  // Group PRs by exercise
  const groupedPRs: Record<string, PR[]> = {};
  prs.forEach((pr) => {
    if (!groupedPRs[pr.exerciseName]) {
      groupedPRs[pr.exerciseName] = [];
    }
    groupedPRs[pr.exerciseName].push(pr);
  });

  // Sort exercises alphabetically
  const exerciseNames = Object.keys(groupedPRs).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Personal Records
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your best performances for each exercise
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total PRs
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {prs.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Exercises
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {exerciseNames.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest PR
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {prs.length > 0
                ? format(
                    new Date(
                      Math.max(...prs.map((pr) => new Date(pr.date).getTime()))
                    ),
                    'MMM d'
                  )
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PRs by Exercise */}
      {prs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No personal records yet. Complete workouts to start tracking your PRs!
            </p>
            <Link href="/templates">
              <Button variant="primary">Start a Workout</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exerciseNames.map((exerciseName) => (
            <Card key={exerciseName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{exerciseName}</CardTitle>
                  <Link href={`/exercises/${encodeURIComponent(exerciseName)}`}>
                    <Button variant="ghost" size="sm">
                      View History →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Weight
                        </th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Reps
                        </th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Workout
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedPRs[exerciseName]
                        .sort((a, b) => b.weight - a.weight)
                        .map((pr) => (
                          <tr
                            key={pr.id}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="py-2 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {pr.weight} kg
                            </td>
                            <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                              {pr.reps} reps
                            </td>
                            <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                              {format(new Date(pr.date), 'MMM d, yyyy')}
                            </td>
                            <td className="py-2 px-4 text-sm text-right">
                              {pr.workoutId && (
                                <Link href={`/workouts/${pr.workoutId}`}>
                                  <Button variant="ghost" size="sm">
                                    View →
                                  </Button>
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
