import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/workouts/[id]/exercises/[exerciseId]/sets - Batch update sets
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  try {
    const { exerciseId } = await params;
    const body = await request.json();
    const { sets } = body;

    // Update each set
    const updatePromises = sets.map((set: any) =>
      prisma.set.update({
        where: { id: set.id },
        data: {
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe,
          restTime: set.restTime,
          completed: set.completed,
        },
      })
    );

    await Promise.all(updatePromises);

    // Return updated exercise with sets
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(exerciseId) },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ data: exercise, success: true });
  } catch (error) {
    console.error('Error updating sets:', error);
    return NextResponse.json(
      { error: 'Failed to update sets', success: false },
      { status: 500 }
    );
  }
}
