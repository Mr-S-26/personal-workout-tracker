import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/templates - List all templates
export async function GET() {
  try {
    const templates = await prisma.workoutTemplate.findMany({
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: templates, success: true });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', success: false },
      { status: 500 }
    );
  }
}
