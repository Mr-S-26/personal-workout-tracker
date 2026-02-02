import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/templates/[id]/instantiate - Create a workout from template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    console.log('📋 Instantiate endpoint called with ID:', templateId);

    // Get the template with exercises
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      console.log('❌ Template not found with ID:', templateId);
      return NextResponse.json(
        { error: 'Template not found', success: false },
        { status: 404 }
      );
    }

    console.log('✅ Template found:', template.name, 'with', template.exercises.length, 'exercises');
    console.log('First 3 exercises:', template.exercises.slice(0, 3).map(e => e.name));

    // Create workout from template
    const workout = await prisma.workout.create({
      data: {
        name: template.name,
        templateId: templateId,
        date: new Date(),
        exercises: {
          create: template.exercises.map((exercise) => ({
            name: exercise.name,
            order: exercise.order,
            targetSets: exercise.targetSets,
            targetReps: exercise.targetReps,
            targetWeight: exercise.targetWeight,
            notes: exercise.notes,
            sets: {
              create: Array.from({ length: exercise.targetSets }, (_, i) => ({
                setNumber: i + 1,
                completed: false,
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

    console.log('🏋️ Workout created:', workout.name, 'with', workout.exercises.length, 'exercises');

    return NextResponse.json({ data: workout, success: true });
  } catch (error) {
    console.error('Error instantiating template:', error);
    return NextResponse.json(
      { error: 'Failed to create workout from template', success: false },
      { status: 500 }
    );
  }
}
