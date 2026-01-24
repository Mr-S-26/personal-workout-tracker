'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SetRowProps {
  setNumber: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  completed: boolean;
  targetReps: string;
  targetWeight?: string | null;
  onComplete: (reps: number, weight: number) => void;
}

export function SetRow({ setNumber, reps, weight, restTime, completed, targetReps, targetWeight, onComplete }: SetRowProps) {
  const [localReps, setLocalReps] = useState(reps?.toString() || '');
  const [localWeight, setLocalWeight] = useState(weight?.toString() || '');

  const handleComplete = () => {
    const repsNum = parseInt(localReps) || 0;
    const weightNum = parseFloat(localWeight) || 0;
    onComplete(repsNum, weightNum);
  };

  const formatRestTime = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 rounded-lg border ${completed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900' : 'bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800'}`}>
      <div className="flex flex-col md:min-w-[80px]">
        <span className="font-semibold text-base text-gray-700 dark:text-white">
          Set {setNumber}
        </span>
        {completed && restTime && (
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            Rest: {formatRestTime(restTime)}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="number"
            placeholder={`Target: ${targetReps}`}
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            disabled={completed}
            className="text-center text-lg font-medium"
          />
          <span className="text-sm text-gray-500 dark:text-zinc-500 block text-center mt-1">reps</span>
        </div>

        <div className="flex-1">
          <Input
            type="number"
            step="0.5"
            placeholder={targetWeight || "Weight"}
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            disabled={completed}
            className="text-center text-lg font-medium"
          />
          <span className="text-sm text-gray-500 dark:text-zinc-500 block text-center mt-1">kg</span>
        </div>
      </div>

      {completed ? (
        <Button variant="secondary" size="md" disabled className="w-full md:w-32">
          ✓ Done
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={handleComplete}
          disabled={!localReps}
          className="w-full md:w-32"
        >
          Complete
        </Button>
      )}
    </div>
  );
}
