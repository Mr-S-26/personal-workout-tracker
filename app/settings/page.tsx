'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { useToast } from '@/lib/contexts/ToastContext';
import {
  exportWorkoutsAsJSON,
  exportWorkoutsAsCSV,
  exportMacrosAsJSON,
  exportMacrosAsCSV,
} from '@/lib/utils/export';

export default function SettingsPage() {
  const { macroTargets, updateMacroTargets, resetMacroTargets } = useSettingsStore();
  const toast = useToast();

  const [calories, setCalories] = useState(macroTargets.calories.toString());
  const [protein, setProtein] = useState(macroTargets.protein.toString());
  const [carbs, setCarbs] = useState(macroTargets.carbs.toString());
  const [fats, setFats] = useState(macroTargets.fats.toString());
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure Zustand store is hydrated from localStorage
  useEffect(() => {
    setIsHydrated(true);
    // Sync form fields with store values after hydration
    setCalories(macroTargets.calories.toString());
    setProtein(macroTargets.protein.toString());
    setCarbs(macroTargets.carbs.toString());
    setFats(macroTargets.fats.toString());
  }, [macroTargets]);

  function handleSave() {
    updateMacroTargets({
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
    });
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  }

  function handleRefreshSettings() {
    // Force reload from localStorage
    const stored = localStorage.getItem('settings-storage');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.state?.macroTargets) {
        setCalories(data.state.macroTargets.calories.toString());
        setProtein(data.state.macroTargets.protein.toString());
        setCarbs(data.state.macroTargets.carbs.toString());
        setFats(data.state.macroTargets.fats.toString());
        toast.success('Settings refreshed from storage');
      }
    } else {
      toast.info('No saved settings found');
    }
  }

  function handleClearCache() {
    if (confirm('Clear app cache and reload? This will refresh all data.')) {
      // Clear service worker caches
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      // Reload page
      window.location.reload();
    }
  }

  function handleReset() {
    if (confirm('Reset to default macro targets?')) {
      resetMacroTargets();
      setCalories('2450');
      setProtein('152');
      setCarbs('290');
      setFats('65');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleExportWorkouts(format: 'json' | 'csv') {
    setExporting(true);
    try {
      const response = await fetch('/api/workouts');
      const result = await response.json();

      if (result.success) {
        if (format === 'json') {
          exportWorkoutsAsJSON(result.data);
          toast.success('Workouts exported as JSON');
        } else {
          exportWorkoutsAsCSV(result.data);
          toast.success('Workouts exported as CSV');
        }
      } else {
        toast.error('Failed to export workouts');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export workouts');
    } finally {
      setExporting(false);
    }
  }

  async function handleExportMacros(format: 'json' | 'csv') {
    setExporting(true);
    try {
      const response = await fetch('/api/macros');
      const result = await response.json();

      if (result.success) {
        if (format === 'json') {
          exportMacrosAsJSON(result.data);
          toast.success('Macros exported as JSON');
        } else {
          exportMacrosAsCSV(result.data);
          toast.success('Macros exported as CSV');
        }
      } else {
        toast.error('Failed to export macros');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export macros');
    } finally {
      setExporting(false);
    }
  }

  const caloriesNum = parseInt(calories) || 0;
  const proteinNum = parseFloat(protein) || 0;
  const carbsNum = parseFloat(carbs) || 0;
  const fatsNum = parseFloat(fats) || 0;

  const calculatedCalories = Math.round(proteinNum * 4 + carbsNum * 4 + fatsNum * 9);
  const calorieDifference = Math.abs(caloriesNum - calculatedCalories);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Macro Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Macro Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set your daily macro targets. These will be used to track your progress in the Macros section.
            </p>
            {isHydrated && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                <p className="font-medium">Current values:</p>
                <p>{macroTargets.protein}g protein</p>
                <p>{macroTargets.calories} cal</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                label="Daily Calorie Target"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="0"
                step="1"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Daily Protein Target (g)"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Daily Carbs Target (g)"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Daily Fats Target (g)"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Calculated Calories Display */}
          {proteinNum > 0 && carbsNum > 0 && fatsNum > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calculated calories from macros: <span className="font-medium">{calculatedCalories} cal</span>
              </p>
              {calorieDifference > calculatedCalories * 0.05 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Note: Your calorie target differs from calculated calories by {calorieDifference} cal. This is okay if intentional.
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Protein: {Math.round(((proteinNum * 4) / calculatedCalories) * 100)}% ({Math.round(proteinNum * 4)} cal)</p>
                <p>Carbs: {Math.round(((carbsNum * 4) / calculatedCalories) * 100)}% ({Math.round(carbsNum * 4)} cal)</p>
                <p>Fats: {Math.round(((fatsNum * 9) / calculatedCalories) * 100)}% ({Math.round(fatsNum * 9)} cal)</p>
              </div>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Presets:</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCalories('2450');
                  setProtein('152');
                  setCarbs('290');
                  setFats('65');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Maintenance (2450 cal)
              </button>
              <button
                onClick={() => {
                  setCalories('2200');
                  setProtein('160');
                  setCarbs('250');
                  setFats('60');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cut (2200 cal)
              </button>
              <button
                onClick={() => {
                  setCalories('2700');
                  setProtein('170');
                  setCarbs('330');
                  setFats('70');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Bulk (2700 cal)
              </button>
            </div>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                Settings saved successfully!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <Button onClick={handleSave} variant="primary" className="flex-1">
                Save Targets
              </Button>
              <Button onClick={handleReset} variant="secondary">
                Reset to Defaults
              </Button>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleRefreshSettings} variant="secondary" className="flex-1">
                🔄 Refresh Settings
              </Button>
              <Button onClick={handleClearCache} variant="secondary" className="flex-1">
                🗑️ Clear Cache
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If settings aren't syncing between devices, try "Refresh Settings" first. If that doesn't work, use "Clear Cache" to force reload all app data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export your workout and macro data for backup or analysis in external tools.
          </p>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Workouts
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleExportWorkouts('json')}
                variant="secondary"
                disabled={exporting}
                className="flex-1"
              >
                {exporting ? 'Exporting...' : 'Export as JSON'}
              </Button>
              <Button
                onClick={() => handleExportWorkouts('csv')}
                variant="secondary"
                disabled={exporting}
                className="flex-1"
              >
                {exporting ? 'Exporting...' : 'Export as CSV'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Exports all workouts with exercises, sets, reps, and weights
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Macros
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleExportMacros('json')}
                variant="secondary"
                disabled={exporting}
                className="flex-1"
              >
                {exporting ? 'Exporting...' : 'Export as JSON'}
              </Button>
              <Button
                onClick={() => handleExportMacros('csv')}
                variant="secondary"
                disabled={exporting}
                className="flex-1"
              >
                {exporting ? 'Exporting...' : 'Export as CSV'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Exports all macro logs with daily calories, protein, carbs, and fats
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
