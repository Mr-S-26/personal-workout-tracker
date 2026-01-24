import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/workouts/[id] - Get a specific workout
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        template: true,
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: workout, success: true });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/workouts/[id] - Update a workout
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, notes, duration } = body;

    const workout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        name,
        notes,
        duration,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    return NextResponse.json({ data: workout, success: true });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { error: 'Failed to update workout', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/[id] - Delete a workout
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.workout.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ data: { id: parseInt(id) }, success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout', success: false },
      { status: 500 }
    );
  }
}
