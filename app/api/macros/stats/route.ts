import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, subDays } from 'date-fns';

// GET /api/macros/stats - Get macro statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, all

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = new Date(0); // all time
    }

    const macros = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    if (macros.length === 0) {
      return NextResponse.json({
        data: {
          count: 0,
          averages: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          period,
        },
        success: true,
      });
    }

    const totals = macros.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fats: acc.fats + log.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const averages = {
      calories: Math.round(totals.calories / macros.length),
      protein: Math.round(totals.protein / macros.length),
      carbs: Math.round(totals.carbs / macros.length),
      fats: Math.round(totals.fats / macros.length),
    };

    return NextResponse.json({
      data: {
        count: macros.length,
        averages,
        totals,
        period,
        startDate,
      },
      success: true,
    });
  } catch (error) {
    console.error('Error fetching macro stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch macro stats', success: false },
      { status: 500 }
    );
  }
}
