import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/macros/[date] - Get macro log for specific date
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const macroLog = await prisma.macroLog.findUnique({
      where: { date: normalizedDate },
    });

    if (!macroLog) {
      return NextResponse.json(
        { error: 'Macro log not found for this date', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: macroLog, success: true });
  } catch (error) {
    console.error('Error fetching macro log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch macro log', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/macros/[date] - Delete macro log for specific date
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    await prisma.macroLog.delete({
      where: { date: normalizedDate },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting macro log:', error);
    return NextResponse.json(
      { error: 'Failed to delete macro log', success: false },
      { status: 500 }
    );
  }
}
