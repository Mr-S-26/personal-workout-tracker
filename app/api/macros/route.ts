import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/macros - List all macro logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    let where = {};
    if (startDate && endDate) {
      where = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      where = {
        date: {
          gte: new Date(startDate),
        },
      };
    } else if (endDate) {
      where = {
        date: {
          lte: new Date(endDate),
        },
      };
    }

    const macros = await prisma.macroLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ data: macros, success: true });
  } catch (error) {
    console.error('Error fetching macros:', error);
    return NextResponse.json(
      { error: 'Failed to fetch macros', success: false },
      { status: 500 }
    );
  }
}

// POST /api/macros - Create or update macro log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, calories, protein, carbs, fats, notes } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', success: false },
        { status: 400 }
      );
    }

    if (
      calories === undefined ||
      protein === undefined ||
      carbs === undefined ||
      fats === undefined
    ) {
      return NextResponse.json(
        { error: 'All macro fields (calories, protein, carbs, fats) are required', success: false },
        { status: 400 }
      );
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      return NextResponse.json(
        { error: 'Macro values cannot be negative', success: false },
        { status: 400 }
      );
    }

    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Upsert (create or update)
    const macroLog = await prisma.macroLog.upsert({
      where: { date: normalizedDate },
      update: {
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        notes: notes || null,
      },
      create: {
        date: normalizedDate,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: macroLog, success: true });
  } catch (error) {
    console.error('Error saving macros:', error);
    return NextResponse.json(
      { error: 'Failed to save macros', success: false },
      { status: 500 }
    );
  }
}
