import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { EditWorkoutForm } from '@/components/workout/EditWorkoutForm';

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id: parseInt(id) },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
