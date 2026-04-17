import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, customerName, customerEmail, shippingAddress } = body;

    if (!items || !items.length || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Customer information and items required.' }, { status: 400 });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const pId = item.productId || item._id || item.id;
      const product = await Product.findById(pId);
      const price = product ? product.price : (item.price || 0);
      const qty = item.quantity || 1;

      calculatedTotal += price * qty;
      orderItems.push({
        productId: String(pId),
        name: product ? product.name : (item.name || 'Mobile Phone'),
        price,
        quantity: qty,
        image: product ? product.image : (item.image || '')
      });

      if (product && product.stock >= qty) {
        product.stock -= qty;
        await product.save();
      }
    }

    const orderNumber = 'EC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    const newOrder = await Order.create({
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress: { address: typeof shippingAddress === 'string' ? shippingAddress : 'Standard Address' },
      items: orderItems,
      total: calculatedTotal,
      paymentMethod: 'Credit Card (Mock Auth)',
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderNumber: newOrder.orderNumber,
      total: calculatedTotal
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
