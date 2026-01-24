import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: template, success: true });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template', success: false },
      { status: 500 }
    );
  }
}
