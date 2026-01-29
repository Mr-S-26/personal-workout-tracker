import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/progress-photos/[id] - Delete progress photo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    await prisma.progressPhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting progress photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete progress photo', success: false },
      { status: 500 }
    );
  }
}
