import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id: parseInt(id) },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      template: true,
    },
  });

  if (!workout) {
    notFound();
  }

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  const totalVolume = workout.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce((s, set) => {
        if (set.completed && set.reps && set.weight) {
          return s + set.reps * set.weight;
        }
        return s;
      }, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {workout.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {format(new Date(workout.date), 'MMMM d, yyyy • h:mm a')}
          </p>
          {workout.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              {workout.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/workouts/${workout.id}/edit`}>
            <Button variant="secondary">Edit Workout</Button>
          </Link>
          <Link href="/workouts">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {workout.duration || 0} min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Exercises</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {workout.exercises.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Sets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {completedSets}/{totalSets}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalVolume.toFixed(0)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{exercise.name}</CardTitle>
                <Link href={`/exercises/${encodeURIComponent(exercise.name)}`}>
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
                        Set
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Reps
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Weight (kg)
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rest Time
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set) => {
                      const formatRestTime = (seconds?: number | null) => {
                        if (!seconds) return '-';
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                      };

                      return (
                        <tr
                          key={set.id}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">
                            {set.setNumber}
                          </td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                            {set.reps || '-'}
                          </td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">
                            {set.weight || '-'}
                          </td>
                          <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
                            {formatRestTime(set.restTime)}
                          </td>
                          <td className="py-2 px-4 text-sm text-center">
                            {set.completed ? (
                              <span className="text-green-600 dark:text-green-400">✓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
