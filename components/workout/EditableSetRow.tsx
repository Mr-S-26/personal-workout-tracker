'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface EditableSetRowProps {
  setNumber: number;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  completed: boolean;
  onUpdate: (data: { reps?: number; weight?: number; rpe?: number; completed: boolean }) => void;
  onDelete?: () => void;
}

export function EditableSetRow({
  setNumber,
  reps,
  weight,
  rpe,
  completed,
  onUpdate,
  onDelete,
}: EditableSetRowProps) {
  const [localReps, setLocalReps] = useState(reps?.toString() || '');
  const [localWeight, setLocalWeight] = useState(weight?.toString() || '');
  const [localRpe, setLocalRpe] = useState(rpe?.toString() || '');
  const [localCompleted, setLocalCompleted] = useState(completed);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({
      reps: localReps ? parseInt(localReps) : undefined,
      weight: localWeight ? parseFloat(localWeight) : undefined,
      rpe: localRpe ? parseInt(localRpe) : undefined,
      completed: localCompleted,
    });
    setHasChanges(false);
  };

  const handleCompletedToggle = () => {
    const newCompleted = !localCompleted;
    setLocalCompleted(newCompleted);
    onUpdate({
      reps: localReps ? parseInt(localReps) : undefined,
      weight: localWeight ? parseFloat(localWeight) : undefined,
      rpe: localRpe ? parseInt(localRpe) : undefined,
      completed: newCompleted,
    });
  };

  return (
    <div className={`flex items-center gap-2 p-3 rounded border ${
      localCompleted
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <span className="font-medium w-16 text-gray-700 dark:text-gray-300">
        Set {setNumber}
      </span>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Reps"
            value={localReps}
            onChange={(e) => {
              setLocalReps(e.target.value);
              handleChange();
            }}
            className="text-center"
            label="Reps"
          />
        </div>

        <div className="flex-1">
          <Input
            type="number"
            step="0.5"
            placeholder="Weight"
            value={localWeight}
            onChange={(e) => {
              setLocalWeight(e.target.value);
              handleChange();
            }}
            className="text-center"
            label="Weight (kg)"
          />
        </div>

        <div className="flex-1">
          <Input
            type="number"
            min="1"
            max="10"
            placeholder="RPE"
            value={localRpe}
            onChange={(e) => {
              setLocalRpe(e.target.value);
              handleChange();
            }}
            className="text-center"
            label="RPE (1-10)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={localCompleted ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleCompletedToggle}
          className="min-w-20"
        >
          {localCompleted ? '✓ Done' : 'Mark Done'}
        </Button>

        {hasChanges && (
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save
          </Button>
        )}

        {onDelete && (
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
