import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/macros/[date] - Get all meals for specific date
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // Normalize date to start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const meals = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [
        { time: 'asc' }
      ],
    });

    return NextResponse.json({ data: meals, success: true });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meals', success: false },
      { status: 500 }
    );
  }
}
