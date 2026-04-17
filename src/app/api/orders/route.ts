import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
    const newOrder = new Order({
      orderNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingAddress: { address: body.shippingAddress?.address || body.address || 'Standard Address' },
      items: body.items,
      total: Number(body.total),
      paymentMethod: body.paymentMethod || 'Credit Card (Mock)',
      status: 'completed'
    });
    const saved = await newOrder.save();
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
