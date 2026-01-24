'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import Link from 'next/link';

interface Workout {
  id: number;
  name: string;
  date: Date;
  duration?: number | null;
  exercises: {
    id: number;
    name: string;
    sets: {
      id: number;
      completed: boolean;
      reps?: number | null;
      weight?: number | null;
    }[];
  }[];
}

interface WorkoutCardProps {
  workout: Workout;
  onDelete?: (id: number) => void;
}

export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  // Calculate total volume (reps × weight)
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{workout.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(workout.date), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
          {workout.duration && (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {workout.duration} min
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Exercises</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {workout.exercises.length}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sets</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {completedSets}/{totalSets}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Volume</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {totalVolume.toFixed(0)} kg
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/workouts/${workout.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                View Details
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="danger"
                onClick={() => onDelete(workout.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
