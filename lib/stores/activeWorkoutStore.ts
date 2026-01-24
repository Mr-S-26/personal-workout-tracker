import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkoutSet {
  id: number;
  setNumber: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  restTime?: number; // actual rest time taken in seconds
  completed: boolean;
}

interface WorkoutExercise {
  id: number;
  name: string;
  order: number;
  notes?: string;
  targetSets: number;
  targetReps: string;
  sets: WorkoutSet[];
}

interface ActiveWorkoutState {
  workoutId: number | null;
  workoutName: string | null;
  startTime: number | null;
  exercises: WorkoutExercise[];

  // Actions
  startWorkout: (workoutId: number, workoutName: string, exercises: WorkoutExercise[]) => void;
  updateSet: (exerciseId: number, setId: number, data: Partial<WorkoutSet>) => void;
  completeSet: (exerciseId: number, setId: number) => void;
  clearWorkout: () => void;
  getWorkoutDuration: () => number;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      workoutId: null,
      workoutName: null,
      startTime: null,
      exercises: [],

      startWorkout: (workoutId, workoutName, exercises) => {
        set({
          workoutId,
          workoutName,
          startTime: Date.now(),
          exercises,
        });
      },

      updateSet: (exerciseId, setId, data) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  sets: exercise.sets.map((s) =>
                    s.id === setId ? { ...s, ...data } : s
                  ),
                }
              : exercise
          ),
        }));
      },

      completeSet: (exerciseId, setId) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  sets: exercise.sets.map((s) =>
                    s.id === setId ? { ...s, completed: true } : s
                  ),
                }
              : exercise
          ),
        }));
      },

      clearWorkout: () => {
        set({
          workoutId: null,
          workoutName: null,
          startTime: null,
          exercises: [],
        });
      },

      getWorkoutDuration: () => {
        const { startTime } = get();
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 60000); // minutes
      },
    }),
    {
      name: 'active-workout-storage',
    }
  )
);
