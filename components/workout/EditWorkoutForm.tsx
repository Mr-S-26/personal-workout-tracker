'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EditableSetRow } from './EditableSetRow';

interface EditWorkoutFormProps {
  workout: any;
}

export function EditWorkoutForm({ workout: initialWorkout }: EditWorkoutFormProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState(initialWorkout);
  const [name, setName] = useState(initialWorkout.name);
  const [notes, setNotes] = useState(initialWorkout.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSetUpdate = async (exerciseId: number, setId: number, data: any) => {
    try {
      const response = await fetch(
        `/api/workouts/${workout.id}/exercises/${exerciseId}/sets`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sets: [{ id: setId, ...data }],
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setWorkout((prev: any) => ({
          ...prev,
          exercises: prev.exercises.map((ex: any) =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s: any) =>
                    s.id === setId ? { ...s, ...data } : s
                  ),
                }
              : ex
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating set:', error);
      alert('Failed to update set');
    }
  };

  const handleSaveWorkout = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notes }),
      });

      if (response.ok) {
        router.push(`/workouts/${workout.id}`);
      } else {
        alert('Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Workout
        </h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/workouts/${workout.id}`)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveWorkout} disabled={saving}>
            {saving ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </div>

      {/* Workout Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Workout Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workout name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this workout..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      {workout.exercises.map((exercise: any) => (
        <Card key={exercise.id}>
          <CardHeader>
            <CardTitle>{exercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exercise.sets.map((set: any) => (
              <EditableSetRow
                key={set.id}
                setNumber={set.setNumber}
                reps={set.reps}
                weight={set.weight}
                rpe={set.rpe}
                completed={set.completed}
                onUpdate={(data) => handleSetUpdate(exercise.id, set.id, data)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
