import { ActiveWorkout } from '@/components/workout/ActiveWorkout/ActiveWorkout';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = parseInt(id);

  // Fetch workout with exercises and sets
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      template: {
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Transform exercises to include target info
  const exercises = workout.exercises.map((exercise) => {
    return {
      id: exercise.id,
      name: exercise.name,
      order: exercise.order,
      notes: exercise.notes || undefined,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      targetWeight: exercise.targetWeight || undefined,
      sets: exercise.sets.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        reps: set.reps || undefined,
        weight: set.weight || undefined,
        completed: set.completed,
      })),
    };
  });

  return (
    <ActiveWorkout
      workoutId={workout.id}
      workoutName={workout.name}
      initialExercises={exercises}
    />
  );
}
