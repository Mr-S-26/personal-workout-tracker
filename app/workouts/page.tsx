'use client';

import { useEffect, useState } from 'react';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'volume'>('date');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    filterAndSortWorkouts();
  }, [workouts, searchTerm, sortBy]);

  async function fetchWorkouts() {
    try {
      const response = await fetch('/api/workouts');
      const result = await response.json();

      if (result.success) {
        setWorkouts(result.data);
        setFilteredWorkouts(result.data);
      } else {
        setError(result.error || 'Failed to fetch workouts');
      }
    } catch (err) {
      setError('Failed to fetch workouts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortWorkouts() {
    let filtered = [...workouts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((workout) =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'volume':
          const volumeA = a.exercises.reduce(
            (sum, ex) =>
              sum +
              ex.sets.reduce((s, set) => {
                if (set.completed && set.reps && set.weight) {
                  return s + set.reps * set.weight;
                }
                return s;
              }, 0),
            0
          );
          const volumeB = b.exercises.reduce(
            (sum, ex) =>
              sum +
              ex.sets.reduce((s, set) => {
                if (set.completed && set.reps && set.weight) {
                  return s + set.reps * set.weight;
                }
                return s;
              }, 0),
            0
          );
          return volumeB - volumeA;
        default:
          return 0;
      }
    });

    setFilteredWorkouts(filtered);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setWorkouts(workouts.filter((w) => w.id !== id));
      } else {
        alert(result.error || 'Failed to delete workout');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete workout');
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Workout History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Workout History
        </h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Workout History
        </h1>
        <Link href="/templates">
          <Button variant="primary">Start New Workout</Button>
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No workouts logged yet. Start your first workout!
          </p>
          <Link href="/templates">
            <Button variant="primary">Browse Templates</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="date">Sort by Date</option>
                <option value="duration">Sort by Duration</option>
                <option value="volume">Sort by Volume</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Found {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Workout Grid */}
          {filteredWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No workouts match your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
