import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format, eachWeekOfInterval } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Previous month for comparison
    const prevMonthStart = startOfMonth(subMonths(targetDate, 1));
    const prevMonthEnd = endOfMonth(subMonths(targetDate, 1));

    // Fetch current month workouts
    const workouts = await prisma.workout.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
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

    // Fetch previous month workouts for comparison
    const prevWorkouts = await prisma.workout.findMany({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
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

    // Fetch current month macros
    const macros = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch previous month macros
    const prevMacros = await prisma.macroLog.findMany({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    // Fetch personal records set this month
    const prsThisMonth = await prisma.personalRecord.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
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

    // Calculate previous month stats for comparison
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

    // Calculate previous month macro stats
    const prevMacroCount = prevMacros.length;
    const prevAvgCalories =
      prevMacroCount > 0
        ? Math.round(prevMacros.reduce((sum, m) => sum + m.calories, 0) / prevMacroCount)
        : 0;

    // Weekly breakdown
    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );

    const weeklyBreakdown = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekWorkouts = workouts.filter((w) => {
        const date = new Date(w.date);
        return date >= weekStart && date <= weekEnd;
      });

      const weekVolume = weekWorkouts.reduce(
        (sum, w) =>
          sum +
          w.exercises.reduce(
            (s, e) =>
              s + e.sets.reduce((v, set) => v + (set.reps || 0) * (set.weight || 0), 0),
            0
          ),
        0
      );

      const weekMacros = macros.filter((m) => {
        const date = new Date(m.date);
        return date >= weekStart && date <= weekEnd;
      });

      const weekAvgCalories =
        weekMacros.length > 0
          ? Math.round(weekMacros.reduce((sum, m) => sum + m.calories, 0) / weekMacros.length)
          : 0;

      return {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        label: format(weekStart, 'MMM d') + ' - ' + format(weekEnd, 'MMM d'),
        workouts: weekWorkouts.length,
        volume: Math.round(weekVolume),
        avgCalories: weekAvgCalories,
      };
    });

    // Top exercises by volume
    const exerciseVolumes: { [key: string]: number } = {};
    const exerciseCounts: { [key: string]: number } = {};
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        const volume = e.sets.reduce(
          (sum, set) => sum + (set.reps || 0) * (set.weight || 0),
          0
        );
        exerciseVolumes[e.name] = (exerciseVolumes[e.name] || 0) + volume;
        exerciseCounts[e.name] = (exerciseCounts[e.name] || 0) + 1;
      });
    });

    const topExercises = Object.entries(exerciseVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, volume]) => ({
        name,
        volume: Math.round(volume),
        count: exerciseCounts[name],
      }));

    // Exercise frequency
    const exerciseFrequency = Object.entries(exerciseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Consistency stats (days with workouts)
    const totalDaysInMonth = Math.ceil(
      (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const workoutDays = new Set(
      workouts.map((w) => format(new Date(w.date), 'yyyy-MM-dd'))
    ).size;
    const consistencyRate = totalDaysInMonth > 0 ? (workoutDays / totalDaysInMonth) * 100 : 0;

    const report = {
      period: {
        start: format(monthStart, 'yyyy-MM-dd'),
        end: format(monthEnd, 'yyyy-MM-dd'),
        label: format(monthStart, 'MMMM yyyy'),
      },
      workouts: {
        total: totalWorkouts,
        totalSets,
        totalVolume: Math.round(totalVolume),
        totalDuration,
        avgDuration,
        workoutDays,
        consistencyRate: Math.round(consistencyRate),
        change: totalWorkouts - prevTotalWorkouts,
        volumeChange: Math.round(totalVolume - prevTotalVolume),
      },
      macros: {
        daysLogged: macroCount,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFats,
        complianceRate: totalDaysInMonth > 0 ? (macroCount / totalDaysInMonth) * 100 : 0,
        calorieChange: avgCalories - prevAvgCalories,
      },
      personalRecords: prsThisMonth,
      weeklyBreakdown,
      topExercises,
      exerciseFrequency,
    };

    return NextResponse.json({ data: report, success: true });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report', success: false },
      { status: 500 }
    );
  }
}
