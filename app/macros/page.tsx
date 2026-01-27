'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { format } from 'date-fns';
import { Input } from '@/components/ui/Input';

interface MacroEntry {
  id: number;
  date: string;
  time: string;
  mealType: string;
  mealName: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes: string | null;
}

interface FavoriteMeal {
  id: number;
  name: string;
  mealType: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes: string | null;
}

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: '🍳' },
  { value: 'LUNCH', label: 'Lunch', icon: '🥗' },
  { value: 'DINNER', label: 'Dinner', icon: '🍽️' },
  { value: 'SNACK', label: 'Snacks', icon: '🍎' },
];

export default function MacrosPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meals, setMeals] = useState<MacroEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('BREAKFAST');
  const [favoriteMealTypes, setFavoriteMealTypes] = useState<Record<number, string>>({});

  // Form state
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [saveToFavorites, setSaveToFavorites] = useState(false);

  const { macroTargets: targets } = useSettingsStore();

  useEffect(() => {
    fetchMeals();
    fetchFavorites();
  }, [selectedDate]);

  async function fetchMeals() {
    try {
      setLoading(true);
      const response = await fetch(`/api/macros?date=${selectedDate}`);
      const result = await response.json();

      if (result.success) {
        setMeals(result.data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFavorites() {
    try {
      const response = await fetch('/api/favorites');
      const result = await response.json();

      if (result.success) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  async function handleAddMeal() {
    try {
      // Add meal to diary
      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedMealType,
          mealName: mealName || null,
          calories: parseInt(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fats: parseFloat(fats) || 0,
        }),
      });

      if (response.ok) {
        // Save to favorites if checkbox is checked
        if (saveToFavorites && mealName) {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: mealName,
              mealType: selectedMealType,
              calories: parseInt(calories) || 0,
              protein: parseFloat(protein) || 0,
              carbs: parseFloat(carbs) || 0,
              fats: parseFloat(fats) || 0,
            }),
          });
          fetchFavorites();
        }

        // Reset form
        setMealName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFats('');
        setSaveToFavorites(false);
        setShowAddMeal(false);

        // Refresh meals
        fetchMeals();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  }

  async function handleDeleteMeal(id: number) {
    if (!confirm('Delete this meal entry?')) return;

    try {
      const response = await fetch(`/api/macros/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMeals();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  }

  async function handleAddFavoriteToDay(favorite: FavoriteMeal) {
    try {
      const selectedType = favoriteMealTypes[favorite.id] || favorite.mealType || 'BREAKFAST';

      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedType,
          mealName: favorite.name,
          calories: favorite.calories,
          protein: favorite.protein,
          carbs: favorite.carbs,
          fats: favorite.fats,
        }),
      });

      if (response.ok) {
        fetchMeals();
        setShowFavorites(false);
      }
    } catch (error) {
      console.error('Error adding favorite to day:', error);
    }
  }

  async function handleDeleteFavorite(id: number) {
    if (!confirm('Remove this favorite?')) return;

    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFavorites();
      }
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  }

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Calculate remaining
  const remaining = {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fats: targets.fats - totals.fats,
  };

  // Group meals by type
  const mealsByType = MEAL_TYPES.map((type) => ({
    ...type,
    meals: meals.filter((m) => m.mealType === type.value),
    total: meals
      .filter((m) => m.mealType === type.value)
      .reduce((sum, m) => sum + m.calories, 0),
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Nutrition Diary
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => setShowFavorites(true)}
            className="flex-1 md:flex-initial"
          >
            ⭐ Favorites ({favorites.length})
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 md:w-auto"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <Card className="border-2 border-blue-500 dark:border-white">
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-white">Calories</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {totals.calories} / {targets.calories}
                <span className={remaining.calories >= 0 ? 'text-green-600 dark:text-green-400 ml-2' : 'text-red-600 dark:text-red-400 ml-2'}>
                  ({remaining.calories >= 0 ? `${remaining.calories} left` : `${Math.abs(remaining.calories)} over`})
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  totals.calories <= targets.calories ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div>
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 dark:text-zinc-400">Protein</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(totals.protein)}g</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">of {targets.protein}g</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totals.protein / targets.protein) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 dark:text-zinc-400">Carbs</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(totals.carbs)}g</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">of {targets.carbs}g</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totals.carbs / targets.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 dark:text-zinc-400">Fats</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(totals.fats)}g</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">of {targets.fats}g</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totals.fats / targets.fats) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals by Type */}
      {mealsByType.map((mealType) => (
        <Card key={mealType.value}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{mealType.icon}</span>
                {mealType.label}
                <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">
                  ({mealType.total} cal)
                </span>
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedMealType(mealType.value);
                  setShowAddMeal(true);
                }}
              >
                + Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mealType.meals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400 italic">No meals logged</p>
            ) : (
              <div className="space-y-3">
                {mealType.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {meal.mealName || 'Meal Entry'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">
                        {meal.calories} cal • P: {Math.round(meal.protein)}g • C: {Math.round(meal.carbs)}g • F: {Math.round(meal.fats)}g
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">
                        {format(new Date(meal.time), 'h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>⭐ Favorite Meals</CardTitle>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {favorites.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-zinc-400 italic text-center py-8">
                  No favorites yet. Add meals and check &quot;Save to favorites&quot; to create quick shortcuts.
                </p>
              ) : (
                favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {favorite.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                          {favorite.calories} cal • P: {Math.round(favorite.protein)}g • C: {Math.round(favorite.carbs)}g • F: {Math.round(favorite.fats)}g
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteFavorite(favorite.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2">
                      <select
                        value={favoriteMealTypes[favorite.id] || favorite.mealType || 'BREAKFAST'}
                        onChange={(e) => setFavoriteMealTypes(prev => ({ ...prev, [favorite.id]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white dark:bg-zinc-900 dark:text-white"
                      >
                        {MEAL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => handleAddFavoriteToDay(favorite)}
                        className="w-full"
                      >
                        + Add to Today
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Meal</CardTitle>
                <button
                  onClick={() => setShowAddMeal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meal Type
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white dark:bg-black dark:text-white min-h-[44px]"
                >
                  {MEAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Meal Name (optional)"
                placeholder="e.g., Chicken Salad"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />

              <Input
                label="Calories"
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />

              <Input
                label="Protein (g)"
                type="number"
                step="0.1"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />

              <Input
                label="Carbs (g)"
                type="number"
                step="0.1"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />

              <Input
                label="Fats (g)"
                type="number"
                step="0.1"
                placeholder="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />

              {/* Save to Favorites */}
              {mealName && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-blue-900">
                  <input
                    type="checkbox"
                    id="saveToFavorites"
                    checked={saveToFavorites}
                    onChange={(e) => setSaveToFavorites(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="saveToFavorites"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    ⭐ Save &quot;{mealName}&quot; to favorites
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMeal}
                  disabled={!calories || !protein || !carbs || !fats}
                  className="flex-1"
                >
                  Add Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
