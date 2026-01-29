import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/progress-photos - List all progress photos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const photos = await prisma.progressPhoto.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ data: photos, success: true });
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress photos', success: false },
      { status: 500 }
    );
  }
}

// POST /api/progress-photos - Create new progress photo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, category, photoData, weight, notes } = body;

    // Validate required fields
    if (!photoData || !category) {
      return NextResponse.json(
        { error: 'Photo data and category are required', success: false },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['FRONT', 'BACK', 'SIDE', 'OTHER'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category', success: false },
        { status: 400 }
      );
    }

    const photo = await prisma.progressPhoto.create({
      data: {
        date: date ? new Date(date) : new Date(),
        category,
        photoData,
        weight: weight ? parseFloat(weight) : null,
        notes,
      },
    });

    return NextResponse.json({ data: photo, success: true });
  } catch (error) {
    console.error('Error creating progress photo:', error);
    return NextResponse.json(
      { error: 'Failed to create progress photo', success: false },
      { status: 500 }
    );
  }
}
