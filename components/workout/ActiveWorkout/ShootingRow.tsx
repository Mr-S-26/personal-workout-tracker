'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ShootingRowProps {
  setNumber: number;
  reps?: number | null; // makes
  weight?: number | null; // attempts
  completed: boolean;
  targetReps?: string;
  onComplete: (makes: number, attempts: number) => void;
  onEdit?: () => void;
}

export function ShootingRow({
  setNumber,
  reps,
  weight,
  completed,
  targetReps,
  onComplete,
  onEdit,
}: ShootingRowProps) {
  const makes = reps || 0;
  const attempts = weight || 0;

  const [localMakes, setLocalMakes] = useState(makes?.toString() || '');
  const [localAttempts, setLocalAttempts] = useState(attempts?.toString() || '');

  const handleComplete = () => {
    const makesNum = parseInt(localMakes) || 0;
    const attemptsNum = parseInt(localAttempts) || 0;

    if (attemptsNum === 0) {
      alert('Please enter number of attempts');
      return;
    }

    if (makesNum > attemptsNum) {
      alert('Makes cannot be greater than attempts');
      return;
    }

    // Store makes in reps, attempts in weight
    onComplete(makesNum, attemptsNum);
  };

  const percentage = attempts > 0 ? Math.round((makes / attempts) * 100) : 0;

  if (completed) {
    return (
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900">
        <span className="font-semibold text-base text-gray-700 dark:text-white md:min-w-[80px]">
          Set {setNumber}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {makes}/{attempts}
            </span>
            <span className="text-lg text-gray-600 dark:text-zinc-400">
              ({percentage}%)
            </span>
          </div>
          {targetReps && (
            <span className="text-sm text-gray-500 dark:text-zinc-500 mt-1 block">
              Target: {targetReps}
            </span>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-600 dark:text-white hover:text-blue-700 dark:hover:text-zinc-300 text-base font-medium min-h-[44px] px-4"
          >
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base text-gray-700 dark:text-white">
          Set {setNumber}
        </span>
        {targetReps && (
          <span className="text-sm text-gray-500 dark:text-zinc-500">
            Target: {targetReps}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="number"
            value={localMakes}
            onChange={(e) => setLocalMakes(e.target.value)}
            placeholder="Makes"
            min="0"
            className="text-center text-lg font-medium"
          />
          <span className="text-sm text-gray-500 dark:text-zinc-500 block text-center mt-1">makes</span>
        </div>

        <span className="text-gray-500 dark:text-zinc-400 font-bold text-2xl">/</span>

        <div className="flex-1">
          <Input
            type="number"
            value={localAttempts}
            onChange={(e) => setLocalAttempts(e.target.value)}
            placeholder="Attempts"
            min="0"
            className="text-center text-lg font-medium"
          />
          <span className="text-sm text-gray-500 dark:text-zinc-500 block text-center mt-1">attempts</span>
        </div>
      </div>

      {localMakes && localAttempts && (
        <div className="text-center">
          <span className="text-lg font-semibold text-blue-600 dark:text-white">
            {Math.round((parseInt(localMakes) / parseInt(localAttempts)) * 100)}%
          </span>
        </div>
      )}

      <Button
        onClick={handleComplete}
        variant="primary"
        disabled={!localMakes || !localAttempts}
        size="md"
        className="w-full"
      >
        {completed ? '✓ Done' : 'Complete'}
      </Button>
    </div>
  );
}
