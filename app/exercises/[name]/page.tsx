'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ExerciseHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseName = decodeURIComponent(params.name as string);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [exerciseName]);

  async function fetchHistory() {
    try {
      const response = await fetch(
        `/api/exercises/${encodeURIComponent(exerciseName)}/history`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching exercise history:', error);
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

  if (!data) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Exercise Not Found
        </h1>
      </div>
    );
  }

  const { exerciseName: name, exercises, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Exercise History & Progression
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Workouts
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalWorkouts}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalSets}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Volume
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalVolume} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rest</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.avgRestTime}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Max Weight
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.maxWeight.weight} kg
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                for {stats.maxWeight.reps} reps
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Max Reps
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.maxReps.reps} reps
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                at {stats.maxReps.weight} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          History
        </h2>
        {exercises.map((exercise: any) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {exercise.workout.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {format(new Date(exercise.workout.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <Link href={`/workouts/${exercise.workout.id}`}>
                  <Button variant="ghost" size="sm">
                    View Workout →
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
                        Set
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Reps
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Weight
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Volume
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set: any) => (
                      <tr
                        key={set.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {set.setNumber}
                        </td>
                        <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                          {set.reps}
                        </td>
                        <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                          {set.weight} kg
                        </td>
                        <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                          {set.reps && set.weight
                            ? (set.reps * set.weight).toFixed(0)
                            : '-'}{' '}
                          kg
                        </td>
                        <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                          {set.restTime ? `${set.restTime}s` : '-'}
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
    </div>
  );
}
