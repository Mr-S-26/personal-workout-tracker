import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/macros - List all macro logs (supports ?date=YYYY-MM-DD or ?startDate=&endDate=)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    let where = {};

    // If specific date is provided, get all meals for that day
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      where = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (startDate && endDate) {
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
      orderBy: [
        { date: 'desc' },
        { time: 'asc' }
      ],
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

// POST /api/macros - Create a new meal entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, mealType, mealName, calories, protein, carbs, fats, notes } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', success: false },
        { status: 400 }
      );
    }

    if (!mealType) {
      return NextResponse.json(
        { error: 'Meal type is required', success: false },
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

    // Create new meal entry
    const macroLog = await prisma.macroLog.create({
      data: {
        date: normalizedDate,
        time: new Date(), // current time
        mealType,
        mealName: mealName || null,
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
