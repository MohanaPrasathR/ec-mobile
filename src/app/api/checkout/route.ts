import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, email, address, items, amount } = body;

    if (!name || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const receiptId = `REC-MDB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

    const formattedItems = items.map((item: { product: { _id?: string; id?: string; name: string; price: number; image: string }; quantity: number }) => ({
      productId: item.product._id || item.product.id || 'unknown',
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    // Create Order document in MongoDB
    const order = await Order.create({
      customerName: name,
      email: email,
      address: address || 'Standard Express Delivery',
      items: formattedItems,
      totalAmount: amount,
      receiptId: receiptId,
      status: 'Processing'
    });

    // Optionally update inventory stock in MongoDB
    for (const item of formattedItems) {
      if (item.productId && item.productId !== 'unknown') {
        try {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }
          });
        } catch (err) {
          console.warn('Could not update stock for product:', item.productId, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully and saved to MongoDB!',
      receiptId: order.receiptId,
      order: order
    });
  } catch (error: unknown) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
