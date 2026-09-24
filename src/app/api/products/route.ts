import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { adminGuard, serverError } from '@/lib/admin';
import { productPatch, searchTerm, ValidationError } from '@/lib/validation';
import Product from '@/models/Product';
import initialProducts from '@/data/initial-products.json';

const SORTS: Record<string, Record<string, 1 | -1>> = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
};

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const brand = searchTerm(params.get('brand'), 30);
    const search = searchTerm(params.get('q') ?? params.get('search'));   // the UI sends ?q=
    const filter: Record<string, unknown> = {};
    if (brand && brand !== 'All') filter.brand = { $regex: `^${brand}$`, $options: 'i' };
    if (search) {
      filter.$or = ['name', 'brand', 'description'].map((f) => ({ [f]: { $regex: search, $options: 'i' } }));
    }

    // First run on an empty database: load the sample catalogue once.
    if ((await Product.estimatedDocumentCount()) === 0) await Product.insertMany(initialProducts);

    const products = await Product.find(filter).sort(SORTS[params.get('sort') ?? ''] ?? SORTS.newest).limit(100).lean();
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const data = productPatch(await request.json().catch(() => null), true);
    await connectToDatabase();
    const saved = await Product.create({ category: 'Smartphones', stock: 20, ...data });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return serverError(error);
  }
}
