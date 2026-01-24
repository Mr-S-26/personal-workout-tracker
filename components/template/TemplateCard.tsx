'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

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

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95">
      <div onClick={() => router.push(`/templates/${template.id}`)} className="min-h-[120px]">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{template.name}</CardTitle>
          {template.category && (
            <span className="inline-block mt-2 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-zinc-900 dark:text-white dark:border dark:border-zinc-700 rounded">
              {template.category}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-700 dark:text-white">
              {template.exercises.length} exercises
            </p>
            <div className="max-h-40 overflow-y-auto">
              <ul className="text-sm md:text-sm space-y-2">
                {template.exercises.slice(0, 5).map((exercise) => (
                  <li key={exercise.id} className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                    {exercise.name.replace(/\[(GYM|BALL|SHOOT|COND|CORE)\]\s*/g, '')} - {exercise.targetSets} x {exercise.targetReps}
                  </li>
                ))}
                {template.exercises.length > 5 && (
                  <li className="text-gray-500 dark:text-zinc-500 italic text-sm">
                    +{template.exercises.length - 5} more exercises
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
