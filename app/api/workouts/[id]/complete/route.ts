import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/workouts/[id]/complete - Mark workout as complete and set duration
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { duration } = body;

    const workout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        duration: duration || 0,
        updatedAt: new Date(),
      },
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

    // Detect and create personal records
    const newPRs = [];
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (!set.reps || !set.weight || set.weight === 0) continue;

        // Check if this is a PR
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

    return NextResponse.json({
      data: workout,
      personalRecords: newPRs,
      success: true,
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json(
      { error: 'Failed to complete workout', success: false },
      { status: 500 }
    );
  }
}
