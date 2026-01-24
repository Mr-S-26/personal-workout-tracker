import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/macros/[id] - Delete a specific meal entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mealId = parseInt(id);

    await prisma.macroLog.delete({
      where: { id: mealId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/macros/[id] - Update a specific meal entry
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mealId = parseInt(id);
    const body = await request.json();
    const { mealType, mealName, calories, protein, carbs, fats, notes } = body;

    const updated = await prisma.macroLog.update({
      where: { id: mealId },
      data: {
        mealType: mealType || undefined,
        mealName: mealName || null,
        calories: calories !== undefined ? parseInt(calories) : undefined,
        protein: protein !== undefined ? parseFloat(protein) : undefined,
        carbs: carbs !== undefined ? parseFloat(carbs) : undefined,
        fats: fats !== undefined ? parseFloat(fats) : undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
      },
    });

    return NextResponse.json({ data: updated, success: true });
  } catch (error) {
    console.error('Error updating meal:', error);
    return NextResponse.json(
      { error: 'Failed to update meal', success: false },
      { status: 500 }
    );
  }
}
