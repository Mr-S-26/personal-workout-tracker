'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MacroCard } from '@/components/macro/MacroCard';
import { Button } from '@/components/ui/Button';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/stores/settingsStore';

interface MacroLog {
  id: number;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string | null;
}

export default function MacroHistoryPage() {
  const [macros, setMacros] = useState<MacroLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Get targets from settings store
  const { macroTargets: targets } = useSettingsStore();

  useEffect(() => {
    fetchMacros();
  }, [currentMonth]);

  async function fetchMacros() {
    setLoading(true);
    try {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const response = await fetch(`/api/macros?startDate=${startDate}&endDate=${endDate}`);
      const result = await response.json();

      if (result.success) {
        setMacros(result.data);
      }
    } catch (error) {
      console.error('Error fetching macros:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(date: Date) {
    if (!confirm('Are you sure you want to delete this macro log?')) {
      return;
    }

    try {
      const dateStr = format(new Date(date), 'yyyy-MM-dd');
      const response = await fetch(`/api/macros/${dateStr}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setMacros((prev) => prev.filter((m) => format(new Date(m.date), 'yyyy-MM-dd') !== dateStr));
      }
    } catch (error) {
      console.error('Error deleting macro:', error);
    }
  }

  function handlePreviousMonth() {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }

  function handleToday() {
    setCurrentMonth(new Date());
  }

  const filteredMacros = macros.filter((macro) => {
    if (!searchTerm) return true;
    const dateStr = format(new Date(macro.date), 'EEEE, MMMM d, yyyy').toLowerCase();
    return dateStr.includes(searchTerm.toLowerCase()) || macro.notes?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Macro History</h1>
        <Link href="/macros">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <Button onClick={handlePreviousMonth} variant="secondary">
            Previous Month
          </Button>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button onClick={handleToday} variant="secondary" size="sm">
              Today
            </Button>
          </div>
          <Button onClick={handleNextMonth} variant="secondary">
            Next Month
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by date or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Stats for Current Month */}
      {macros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Month Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Days Logged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {macros.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    macros.reduce((sum, m) => sum + m.calories, 0) / macros.length
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Protein</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    macros.reduce((sum, m) => sum + m.protein, 0) / macros.length
                  )}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Carbs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    macros.reduce((sum, m) => sum + m.carbs, 0) / macros.length
                  )}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Fats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    macros.reduce((sum, m) => sum + m.fats, 0) / macros.length
                  )}g
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Macro List */}
      {filteredMacros.length > 0 ? (
        <div className="space-y-4">
          {filteredMacros.map((macro) => (
            <MacroCard
              key={macro.id}
              date={macro.date}
              calories={macro.calories}
              protein={macro.protein}
              carbs={macro.carbs}
              fats={macro.fats}
              notes={macro.notes}
              targets={targets}
              onDelete={() => handleDelete(macro.date)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'No macro logs found matching your search.'
                : `No macro logs found for ${format(currentMonth, 'MMMM yyyy')}.`}
            </p>
            <Link href="/macros" className="mt-4 inline-block">
              <Button variant="primary">Log Today&apos;s Macros</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
