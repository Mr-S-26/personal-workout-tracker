import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/timer-presets - Get all rest timer presets
export async function GET() {
  try {
    const presets = await prisma.restTimerPreset.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: presets, success: true });
  } catch (error) {
    console.error('Error fetching timer presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer presets', success: false },
      { status: 500 }
    );
  }
}
