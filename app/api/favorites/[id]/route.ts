import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/favorites/[id] - Delete a favorite meal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const favoriteId = parseInt(id);

    await prisma.favoriteMeal.delete({
      where: { id: favoriteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite', success: false },
      { status: 500 }
    );
  }
}
