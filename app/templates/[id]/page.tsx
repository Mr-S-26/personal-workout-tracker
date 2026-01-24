'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface TemplateExercise {
  id: number;
  name: string;
  order: number;
  targetSets: number;
  targetReps: string;
  targetWeight?: string | null;
  notes?: string | null;
}

interface Template {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  exercises: TemplateExercise[];
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [resolvedParams.id]);

  async function fetchTemplate() {
    try {
      const response = await fetch(`/api/templates/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setTemplate(result.data);
      } else {
        setError(result.error || 'Failed to fetch template');
      }
    } catch (err) {
      setError('Failed to fetch template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartWorkout() {
    if (!template) return;

    setStarting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}/instantiate`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to active workout page
        router.push(`/workouts/active/${result.data.id}`);
      } else {
        alert(result.error || 'Failed to start workout');
        setStarting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start workout');
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Loading Template...
          </h1>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Template Not Found
          </h1>
          <Link href="/templates">
            <Button variant="secondary">Back to Templates</Button>
          </Link>
        </div>
        <p className="text-base text-red-600">{error || 'Template not found'}</p>
      </div>
    );
  }

  // Group exercises by type
  const gymExercises = template.exercises.filter((e) => e.name.includes('[GYM]'));
  const ballHandlingExercises = template.exercises.filter((e) => e.name.includes('[BALL]'));
  const shootingExercises = template.exercises.filter((e) => e.name.includes('[SHOOT]'));
  const conditioningExercises = template.exercises.filter((e) => e.name.includes('[COND]'));
  const coreExercises = template.exercises.filter((e) => e.name.includes('[CORE]'));
  const warmupExercises = template.exercises.filter(
    (e) => e.name.includes('Warm-up') && !e.name.includes('[')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {template.name}
          </h1>
          {template.description && (
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">{template.description}</p>
          )}
          {template.category && (
            <span className="inline-block mt-3 px-4 py-2 text-base font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg">
              {template.category}
            </span>
          )}
        </div>
        <Link href="/templates" className="w-full md:w-auto">
          <Button variant="secondary" className="w-full md:w-auto">Back to Templates</Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Exercises</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {template.exercises.length}
              </p>
            </div>
            {gymExercises.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gym Exercises</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {gymExercises.length}
                </p>
              </div>
            )}
            {ballHandlingExercises.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ball Handling</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {ballHandlingExercises.length}
                </p>
              </div>
            )}
            {shootingExercises.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shooting Drills</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {shootingExercises.length}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Start Workout Button */}
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardContent className="py-8">
          <div className="text-center space-y-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Ready to start this workout?
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              This will create a new workout session with all {template.exercises.length} exercises
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartWorkout}
              disabled={starting}
              className="w-full md:w-auto md:min-w-[250px] text-lg"
            >
              {starting ? 'Starting...' : '🏋️ Start Workout'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List - Grouped by Type */}
      {warmupExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Warm-up Exercises ({warmupExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warmupExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetSets} × {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {gymExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💪 Gym Exercises ({gymExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gymExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name.replace('[GYM] ', '')}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetSets} × {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {ballHandlingExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏀 Ball Handling Drills ({ballHandlingExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ballHandlingExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name.replace('[BALL] ', '')}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {shootingExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Shooting Drills ({shootingExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shootingExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name.replace('[SHOOT] ', '')}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {conditioningExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏃 Conditioning ({conditioningExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conditioningExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name.replace('[COND] ', '')}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {coreExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Core Work ({coreExercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coreExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name.replace('[CORE] ', '')}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    {exercise.targetSets} × {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
