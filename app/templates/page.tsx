'use client';

import { useEffect, useState } from 'react';
import { TemplateCard } from '@/components/template/TemplateCard';

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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/templates');
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      } else {
        setError(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('Failed to fetch templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
          Workout Templates
        </h1>
        <p className="text-base text-gray-600 dark:text-zinc-400">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
          Workout Templates
        </h1>
        <p className="text-base text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
        Workout Templates
      </h1>

      {templates.length === 0 ? (
        <p className="text-gray-600 dark:text-zinc-400">
          No templates found. Run the seed script to add templates.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
            />
          ))}
        </div>
      )}
    </div>
  );
}
