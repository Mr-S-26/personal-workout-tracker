'use client';

import { useEffect, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Workout {
  id: number;
  name: string;
  date: Date;
  duration?: number | null;
  exercises: {
    id: number;
    name: string;
    sets: {
      id: number;
      completed: boolean;
      reps?: number | null;
      weight?: number | null;
    }[];
  }[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, [currentDate]);

  async function fetchWorkouts() {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await fetch(
        `/api/workouts?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const result = await response.json();

      if (result.success) {
        setWorkouts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getWorkoutsForDay = (day: Date) => {
    return workouts.filter((workout) => isSameDay(new Date(workout.date), day));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Workout Calendar
        </h1>
        <Link href="/templates">
          <Button variant="primary" size="sm">
            Start Workout
          </Button>
        </Link>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
        <Button variant="secondary" size="sm" onClick={handlePreviousMonth}>
          ← Prev
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={handleNextMonth}>
          Next →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-zinc-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs md:text-sm font-semibold text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayWorkouts = getWorkoutsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[80px] md:min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-zinc-800 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-zinc-900/50' : ''
                } ${isTodayDate ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
              >
                <div
                  className={`text-xs md:text-sm font-medium mb-1 ${
                    !isCurrentMonth
                      ? 'text-gray-400 dark:text-zinc-600'
                      : isTodayDate
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                {/* Workouts for this day */}
                {loading ? (
                  <div className="text-xs text-gray-400 dark:text-zinc-600">...</div>
                ) : (
                  <div className="space-y-1">
                    {dayWorkouts.map((workout) => (
                      <Link
                        key={workout.id}
                        href={
                          workout.duration
                            ? `/workouts/${workout.id}`
                            : `/workouts/active/${workout.id}`
                        }
                        className="block"
                      >
                        <div
                          className={`text-[10px] md:text-xs p-1 rounded truncate ${
                            workout.duration
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60'
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60'
                          }`}
                          title={workout.name}
                        >
                          {workout.duration ? '✓' : '⏸'} {workout.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded"></div>
          <span className="text-gray-600 dark:text-zinc-400">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-900 rounded"></div>
          <span className="text-gray-600 dark:text-zinc-400">✓ Completed Workout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-900 rounded"></div>
          <span className="text-gray-600 dark:text-zinc-400">⏸ In Progress</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400">This Month</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {workouts.filter((w) => w.duration).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-500">Completed</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {workouts.filter((w) => !w.duration).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-500">Workouts</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400">Total Time</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(
              workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-500">Hours</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400">Total Volume</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(
              workouts.reduce(
                (sum, w) =>
                  sum +
                  w.exercises.reduce(
                    (exSum, ex) =>
                      exSum +
                      ex.sets.reduce((setSum, set) => {
                        if (set.completed && set.reps && set.weight) {
                          return setSum + set.reps * set.weight;
                        }
                        return setSum;
                      }, 0),
                    0
                  ),
                0
              ) / 1000
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-500">Tons</p>
        </div>
      </div>
    </div>
  );
}
