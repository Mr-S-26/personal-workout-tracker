import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/exercises/[name]/history - Get all historical data for a specific exercise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const exerciseName = decodeURIComponent(name);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all exercises with this name, with their sets and workout info
    const exercises = await prisma.exercise.findMany({
      where: { name: exerciseName },
      include: {
        sets: {
          where: { completed: true },
          orderBy: { setNumber: 'asc' },
        },
        workout: {
          select: {
            id: true,
            name: true,
            date: true,
            duration: true,
          },
        },
      },
      orderBy: {
        workout: {
          date: 'desc',
        },
      },
      take: limit,
    });

    // Calculate statistics
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce((s, set) => {
          if (set.reps && set.weight) {
            return s + set.reps * set.weight;
          }
          return s;
        }, 0),
      0
    );

    // Find max weight
    let maxWeight = 0;
    let maxWeightReps = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.weight && set.weight > maxWeight) {
          maxWeight = set.weight;
          maxWeightReps = set.reps || 0;
        }
      });
    });

    // Find max reps
    let maxReps = 0;
    let maxRepsWeight = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.reps && set.reps > maxReps) {
          maxReps = set.reps;
          maxRepsWeight = set.weight || 0;
        }
      });
    });

    // Calculate average rest time
    const setsWithRest = exercises.reduce(
      (arr, ex) => [...arr, ...ex.sets.filter((s) => s.restTime)],
      [] as any[]
    );
    const avgRestTime =
      setsWithRest.length > 0
        ? setsWithRest.reduce((sum, set) => sum + (set.restTime || 0), 0) /
          setsWithRest.length
        : 0;

    const stats = {
      totalWorkouts: exercises.length,
      totalSets,
      totalVolume: Math.round(totalVolume),
      maxWeight: { weight: maxWeight, reps: maxWeightReps },
      maxReps: { reps: maxReps, weight: maxRepsWeight },
      avgRestTime: Math.round(avgRestTime),
    };

    return NextResponse.json({
      data: {
        exerciseName,
        exercises,
        stats,
      },
      success: true,
    });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise history', success: false },
      { status: 500 }
    );
  }
}
