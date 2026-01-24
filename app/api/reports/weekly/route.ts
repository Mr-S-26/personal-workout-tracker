import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 }); // Sunday

    // Previous week for comparison
    const prevWeekStart = startOfWeek(subWeeks(targetDate, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(targetDate, 1), { weekStartsOn: 1 });

    // Fetch current week workouts
    const workouts = await prisma.workout.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        exercises: {
          include: {
            sets: {
              where: { completed: true },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch previous week workouts for comparison
    const prevWorkouts = await prisma.workout.findMany({
      where: {
        date: {
          gte: prevWeekStart,
          lte: prevWeekEnd,
        },
      },
      include: {
        exercises: {
          include: {
            sets: {
              where: { completed: true },
            },
          },
        },
      },
    });

    // Fetch current week macros
    const macros = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch previous week macros
    const prevMacros = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: prevWeekStart,
          lte: prevWeekEnd,
        },
      },
    });

    // Fetch personal records set this week
    const prsThisWeek = await prisma.personalRecord.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate workout stats
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce(
      (sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.length, 0),
      0
    );
    const totalVolume = workouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, e) =>
            s + e.sets.reduce((v, set) => v + (set.reps || 0) * (set.weight || 0), 0),
          0
        ),
      0
    );
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Calculate previous week stats for comparison
    const prevTotalWorkouts = prevWorkouts.length;
    const prevTotalSets = prevWorkouts.reduce(
      (sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.length, 0),
      0
    );
    const prevTotalVolume = prevWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, e) =>
            s + e.sets.reduce((v, set) => v + (set.reps || 0) * (set.weight || 0), 0),
          0
        ),
      0
    );

    // Calculate macro stats
    const macroCount = macros.length;
    const avgCalories =
      macroCount > 0
        ? Math.round(macros.reduce((sum, m) => sum + m.calories, 0) / macroCount)
        : 0;
    const avgProtein =
      macroCount > 0
        ? Math.round(macros.reduce((sum, m) => sum + m.protein, 0) / macroCount)
        : 0;
    const avgCarbs =
      macroCount > 0
        ? Math.round(macros.reduce((sum, m) => sum + m.carbs, 0) / macroCount)
        : 0;
    const avgFats =
      macroCount > 0
        ? Math.round(macros.reduce((sum, m) => sum + m.fats, 0) / macroCount)
        : 0;

    // Calculate previous week macro stats
    const prevMacroCount = prevMacros.length;
    const prevAvgCalories =
      prevMacroCount > 0
        ? Math.round(prevMacros.reduce((sum, m) => sum + m.calories, 0) / prevMacroCount)
        : 0;

    // Calculate daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const dayWorkouts = workouts.filter(
        (w) => format(new Date(w.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      const dayMacros = macros.find(
        (m) => format(new Date(m.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      const dayVolume = dayWorkouts.reduce(
        (sum, w) =>
          sum +
          w.exercises.reduce(
            (s, e) =>
              s + e.sets.reduce((v, set) => v + (set.reps || 0) * (set.weight || 0), 0),
            0
          ),
        0
      );

      dailyBreakdown.push({
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek: format(day, 'EEEE'),
        workouts: dayWorkouts.length,
        volume: dayVolume,
        calories: dayMacros?.calories || null,
        protein: dayMacros?.protein || null,
      });
    }

    // Top exercises by volume
    const exerciseVolumes: { [key: string]: number } = {};
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        const volume = e.sets.reduce(
          (sum, set) => sum + (set.reps || 0) * (set.weight || 0),
          0
        );
        exerciseVolumes[e.name] = (exerciseVolumes[e.name] || 0) + volume;
      });
    });

    const topExercises = Object.entries(exerciseVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, volume]) => ({ name, volume }));

    const report = {
      period: {
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd'),
        label: format(weekStart, 'MMM d') + ' - ' + format(weekEnd, 'MMM d, yyyy'),
      },
      workouts: {
        total: totalWorkouts,
        totalSets,
        totalVolume: Math.round(totalVolume),
        avgDuration,
        change: totalWorkouts - prevTotalWorkouts,
        volumeChange: Math.round(totalVolume - prevTotalVolume),
      },
      macros: {
        daysLogged: macroCount,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFats,
        calorieChange: avgCalories - prevAvgCalories,
      },
      personalRecords: prsThisWeek,
      dailyBreakdown,
      topExercises,
    };

    return NextResponse.json({ data: report, success: true });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly report', success: false },
      { status: 500 }
    );
  }
}
