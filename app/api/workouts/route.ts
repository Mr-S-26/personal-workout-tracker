import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/workouts - List all workouts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const workouts = await prisma.workout.findMany({
      include: {
        exercises: {
          include: {
            sets: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: workouts, success: true });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts', success: false },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Create a new workout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, templateId, exercises } = body;

    const workout = await prisma.workout.create({
      data: {
        name,
        templateId,
        date: new Date(),
        exercises: {
          create: exercises?.map((exercise: any) => ({
            name: exercise.name,
            order: exercise.order,
            notes: exercise.notes,
            sets: {
              create: exercise.sets?.map((set: any) => ({
                setNumber: set.setNumber,
                reps: set.reps,
                weight: set.weight,
                completed: set.completed || false,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ data: workout, success: true });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout', success: false },
      { status: 500 }
    );
  }
}
