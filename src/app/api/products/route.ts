import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const search = searchParams.get('q');
    const sort = searchParams.get('sort');

    const filter: Record<string, unknown> = {};

    if (brand && brand !== 'All') {
      filter.brand = brand;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }

    const products = await Product.find(filter).sort(sortOptions);
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: unknown) {
    console.error('Error fetching products from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Database connection error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.brand || !body.price || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Name, brand, price, and image URL are required.' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name: body.name,
      brand: body.brand,
      price: Number(body.price),
      image: body.image,
      description: body.description || '',
      category: body.category || 'Smartphones',
      specs: body.specs || {
        ram: body.ram || '8GB',
        storage: body.storage || '128GB',
        battery: body.battery || '4500 mAh',
        camera: body.camera || '50 MP',
        display: body.display || '6.5" OLED'
      },
      rating: body.rating ? Number(body.rating) : 4.5,
      stock: body.stock ? Number(body.stock) : 10
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
