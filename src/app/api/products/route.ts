import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import initialProducts from '@/data/initial-products.json';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    let filterQuery: any = {};
    if (brand && brand !== 'All') {
      filterQuery.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Product.find(filterQuery);
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    let products = await query.exec();
    if (products.length === 0 && !brand && !search) {
      try {
        await Product.insertMany(initialProducts);
        products = await Product.find({}).sort({ createdAt: -1 });
      } catch (e) {}
    }

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.brand || !body.price || !body.image) {
      return NextResponse.json({ success: false, error: 'Name, Brand, Price and Image URL are required' }, { status: 400 });
    }

    const newProduct = new Product({
      name: body.name,
      brand: body.brand,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      category: body.category || 'Smartphones',
      image: body.image,
      images: body.images || [body.image],
      description: body.description || `${body.name} flagship mobile phone.`,
      stock: body.stock !== undefined ? Number(body.stock) : 20,
      specs: body.specs || {
        display: '6.7-inch AMOLED 120Hz',
        processor: 'Flagship Processor',
        ram: '8GB',
        storage: '256GB',
        battery: '5000 mAh',
        camera: '50MP Triple Camera',
        os: 'Android 14',
        network: '5G'
      }
    });

    const saved = await newProduct.save();
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
