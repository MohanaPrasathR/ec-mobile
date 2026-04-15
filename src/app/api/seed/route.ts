import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import initialProducts from '@/data/initial-products.json';

export async function POST() {
  try {
    await connectToDatabase();
    const count = await Product.countDocuments();
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already seeded with ${count} products.`,
        count
      });
    }

    const inserted = await Product.insertMany(initialProducts);
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} mobile phones into MongoDB!`,
      products: inserted
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
