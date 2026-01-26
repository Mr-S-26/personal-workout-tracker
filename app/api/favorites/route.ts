import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/favorites - List all favorite meals
export async function GET() {
  try {
    const favorites = await prisma.favoriteMeal.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: favorites, success: true });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites', success: false },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Create a new favorite meal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mealType, calories, protein, carbs, fats, notes } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', success: false },
        { status: 400 }
      );
    }

    if (
      calories === undefined ||
      protein === undefined ||
      carbs === undefined ||
      fats === undefined
    ) {
      return NextResponse.json(
        { error: 'All macro fields are required', success: false },
        { status: 400 }
      );
    }

    const favorite = await prisma.favoriteMeal.create({
      data: {
        name,
        mealType: mealType || null,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: favorite, success: true });
  } catch (error) {
    console.error('Error creating favorite:', error);
    return NextResponse.json(
      { error: 'Failed to create favorite', success: false },
      { status: 500 }
    );
  }
}
