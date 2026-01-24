'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SetRow } from './SetRow';
import { ShootingRow } from './ShootingRow';

interface Set {
  id: number;
  setNumber: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  completed: boolean;
}

interface Exercise {
  id: number;
  name: string;
  order: number;
  notes?: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: string | null;
  sets: Set[];
}

interface ExerciseTrackerProps {
  exercise: Exercise;
  onSetComplete: (setId: number, reps: number, weight: number) => void;
}

export function ExerciseTracker({ exercise, onSetComplete }: ExerciseTrackerProps) {
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;
  const allComplete = completedSets === totalSets;

  // Detect if this is a shooting drill
  const isShootingDrill = exercise.name.includes('[SHOOT]');
  const isBallHandling = exercise.name.includes('[BALL]');
  const isConditioning = exercise.name.includes('[COND]');

  // Customize target label based on exercise type
  let targetLabel = `Target: ${exercise.targetSets} sets × ${exercise.targetReps}`;
  if (isShootingDrill) {
    targetLabel = `Target: ${exercise.targetReps}`;
  } else if (isBallHandling || isConditioning) {
    targetLabel = `Target: ${exercise.targetReps}`;
  }

  return (
    <Card className={allComplete ? 'border-2 border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{exercise.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {targetLabel}
            </p>
            {exercise.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                {exercise.notes}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${allComplete ? 'text-green-600' : 'text-gray-600'}`}>
              {completedSets}/{totalSets} sets
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exercise.sets.map((set) => (
            isShootingDrill ? (
              <ShootingRow
                key={set.id}
                setNumber={set.setNumber}
                reps={set.reps}
                weight={set.weight}
                completed={set.completed}
                targetReps={exercise.targetReps}
                onComplete={(makes, attempts) => onSetComplete(set.id, makes, attempts)}
              />
            ) : (
              <SetRow
                key={set.id}
                setNumber={set.setNumber}
                reps={set.reps}
                weight={set.weight}
                restTime={set.restTime}
                completed={set.completed}
                targetReps={exercise.targetReps}
                targetWeight={exercise.targetWeight}
                onComplete={(reps, weight) => onSetComplete(set.id, reps, weight)}
              />
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
