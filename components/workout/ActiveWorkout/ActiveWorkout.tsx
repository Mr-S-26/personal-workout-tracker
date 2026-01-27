'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveWorkoutStore } from '@/lib/stores/activeWorkoutStore';
import { useTimerStore } from '@/lib/stores/timerStore';
import { ExerciseTracker } from './ExerciseTracker';
import { Button } from '@/components/ui/Button';
import { RestTimer } from '@/components/workout/RestTimer/RestTimer';
import { AutoDrillTimer } from '@/components/workout/AutoDrillTimer';

interface ActiveWorkoutProps {
  workoutId: number;
  workoutName: string;
  initialExercises: any[];
}

export function ActiveWorkout({ workoutId, workoutName, initialExercises }: ActiveWorkoutProps) {
  const router = useRouter();
  const {
    exercises,
    startWorkout,
    updateSet,
    clearWorkout,
    getWorkoutDuration,
  } = useActiveWorkoutStore();

  const timerStore = useTimerStore();
  const [timerPresets, setTimerPresets] = useState<any[]>([]);
  const [showTimer, setShowTimer] = useState(true);
  const [lastCompletedSet, setLastCompletedSet] = useState<{ exerciseId: number; setId: number; time: number } | null>(null);
  const [showAutoDrillTimer, setShowAutoDrillTimer] = useState(false);

  // Detect ball handling drills (exercises with "sec" in targetReps or [BALL] in name)
  const ballHandlingDrills = initialExercises.filter((ex) => {
    const hasSecInReps = ex.targetReps && ex.targetReps.includes('sec');
    const hasBallTag = ex.name && ex.name.includes('[BALL]');
    return hasSecInReps || hasBallTag;
  }).map((ex) => ({
    id: ex.id,
    name: ex.name.replace('[BALL]', '').trim(),
    duration: 15, // 15 seconds per drill
  }));

  const isDailyWarmup = workoutName.toUpperCase().includes('WARM') || workoutName.toUpperCase().includes('DAILY');

  useEffect(() => {
    // Initialize workout in store if not already started
    if (exercises.length === 0) {
      startWorkout(workoutId, workoutName, initialExercises);
    }

    // Fetch timer presets
    fetchTimerPresets();
  }, []);

  async function fetchTimerPresets() {
    try {
      const response = await fetch('/api/timer-presets');
      const result = await response.json();
      if (result.success) {
        setTimerPresets(result.data);
      }
    } catch (error) {
      console.error('Error fetching timer presets:', error);
    }
  }

  const handleSetComplete = async (exerciseId: number, setId: number, reps: number, weight: number) => {
    // Calculate rest time if timer was active
    let restTime: number | undefined;
    if (timerStore.isActive && timerStore.targetSetId === lastCompletedSet?.setId) {
      // User completed a set while timer was running - calculate time taken
      restTime = timerStore.totalDuration - timerStore.timeRemaining;
    }

    // Update local state
    updateSet(exerciseId, setId, { reps, weight, completed: true, restTime });

    // Sync to backend
    try {
      await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sets: [{
            id: setId,
            reps,
            weight,
            completed: true,
            restTime,
          }],
        }),
      });
    } catch (error) {
      console.error('Error updating set:', error);
    }

    // Auto-start rest timer (default to 90 seconds or first preset)
    const defaultRestTime = timerPresets[2]?.duration || 90; // 90s preset
    timerStore.start(defaultRestTime, exerciseId, setId);
    setLastCompletedSet({ exerciseId, setId, time: Date.now() });
  };

  const handleFinishWorkout = async () => {
    const duration = getWorkoutDuration();

    try {
      // Mark workout as complete
      await fetch(`/api/workouts/${workoutId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });

      // Clear active workout state
      clearWorkout();

      // Navigate to workout history
      router.push('/workouts');
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Failed to complete workout');
    }
  };

  const handleAutoDrillComplete = () => {
    setShowAutoDrillTimer(false);
    // Optionally mark all ball handling sets as completed
    ballHandlingDrills.forEach((drill) => {
      const exercise = exercises.find((ex) => ex.id === drill.id);
      if (exercise) {
        exercise.sets.forEach((set) => {
          if (!set.completed) {
            handleSetComplete(exercise.id, set.id, 1, 0); // Mark as done with dummy values
          }
        });
      }
    });
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Show auto-drill timer if active
  if (showAutoDrillTimer && ballHandlingDrills.length > 0) {
    return (
      <div className="space-y-6">
        <AutoDrillTimer
          drills={ballHandlingDrills}
          onComplete={handleAutoDrillComplete}
          onExit={() => setShowAutoDrillTimer(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {workoutName}
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {completedSets}/{totalSets} sets completed
            </p>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {isDailyWarmup && ballHandlingDrills.length > 0 && (
              <Button
                variant="primary"
                onClick={() => setShowAutoDrillTimer(true)}
                size="sm"
              >
                ⏱️ Auto Drills
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowTimer(!showTimer)}
              size="sm"
            >
              {showTimer ? 'Hide' : 'Show'} Timer
            </Button>
            <Button
              variant="primary"
              onClick={handleFinishWorkout}
              disabled={completedSets === 0}
            >
              Finish Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Rest Timer (collapsible) */}
      {showTimer && (
        <div className="lg:fixed lg:top-24 lg:right-8 lg:w-96 lg:z-10">
          <RestTimer
            presets={timerPresets}
            exerciseId={timerStore.targetExerciseId || undefined}
            setId={timerStore.targetSetId || undefined}
          />
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <ExerciseTracker
            key={exercise.id}
            exercise={exercise}
            onSetComplete={(setId, reps, weight) =>
              handleSetComplete(exercise.id, setId, reps, weight)
            }
          />
        ))}
      </div>
    </div>
  );
}
