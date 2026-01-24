import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/personal-records - Get all personal records, optionally filtered by exercise
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseName = searchParams.get('exercise');

    const where = exerciseName ? { exerciseName } : {};

    const prs = await prisma.personalRecord.findMany({
      where,
      orderBy: [
        { exerciseName: 'asc' },
        { weight: 'desc' },
        { reps: 'desc' },
      ],
    });

    return NextResponse.json({ data: prs, success: true });
  } catch (error) {
    console.error('Error fetching personal records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal records', success: false },
      { status: 500 }
    );
  }
}

// POST /api/personal-records - Detect and create personal records from a workout
export async function POST(request: Request) {
  try {
    const { workoutId } = await request.json();

    // Get workout with all exercises and completed sets
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            sets: {
              where: { completed: true },
            },
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found', success: false },
        { status: 404 }
      );
    }

    const newPRs = [];

    // Check each exercise for potential PRs
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (!set.reps || !set.weight || set.weight === 0) continue;

        // Check if this is a PR for this exercise/weight/rep combination
        const existingPR = await prisma.personalRecord.findUnique({
          where: {
            exerciseName_weight_reps: {
              exerciseName: exercise.name,
              weight: set.weight,
              reps: set.reps,
            },
          },
        });

        if (!existingPR) {
          // New PR!
          const pr = await prisma.personalRecord.create({
            data: {
              exerciseName: exercise.name,
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
              workoutId: workout.id,
            },
          });
          newPRs.push(pr);
        }
      }
    }

    return NextResponse.json({ data: newPRs, success: true });
  } catch (error) {
    console.error('Error detecting personal records:', error);
    return NextResponse.json(
      { error: 'Failed to detect personal records', success: false },
      { status: 500 }
    );
  }
}
