import { format } from 'date-fns';

interface Workout {
  id: number;
  name: string;
  date: Date;
  duration?: number | null;
  notes?: string | null;
  exercises: Array<{
    id: number;
    name: string;
    order: number;
    sets: Array<{
      id: number;
      setNumber: number;
      reps?: number | null;
      weight?: number | null;
      rpe?: number | null;
      restTime?: number | null;
      completed: boolean;
    }>;
  }>;
}

interface MacroLog {
  id: number;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string | null;
}

export function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportWorkoutsAsJSON(workouts: Workout[]) {
  const filename = `workouts-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadJSON(workouts, filename);
}

export function exportWorkoutsAsCSV(workouts: Workout[]) {
  const rows: string[][] = [
    [
      'Workout ID',
      'Workout Name',
      'Date',
      'Duration (min)',
      'Exercise',
      'Set Number',
      'Reps',
      'Weight (lbs)',
      'RPE',
      'Rest Time (s)',
      'Completed',
      'Notes',
    ],
  ];

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        rows.push([
          workout.id.toString(),
          workout.name,
          format(new Date(workout.date), 'yyyy-MM-dd'),
          workout.duration?.toString() || '',
          exercise.name,
          set.setNumber.toString(),
          set.reps?.toString() || '',
          set.weight?.toString() || '',
          set.rpe?.toString() || '',
          set.restTime?.toString() || '',
          set.completed ? 'Yes' : 'No',
          workout.notes || '',
        ]);
      });
    });
  });

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const filename = `workouts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadCSV(csv, filename);
}

export function exportMacrosAsJSON(macros: MacroLog[]) {
  const filename = `macros-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadJSON(macros, filename);
}

export function exportMacrosAsCSV(macros: MacroLog[]) {
  const rows: string[][] = [
    ['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)', 'Notes'],
  ];

  macros.forEach((macro) => {
    rows.push([
      format(new Date(macro.date), 'yyyy-MM-dd'),
      macro.calories.toString(),
      macro.protein.toString(),
      macro.carbs.toString(),
      macro.fats.toString(),
      macro.notes || '',
    ]);
  });

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const filename = `macros-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadCSV(csv, filename);
}
