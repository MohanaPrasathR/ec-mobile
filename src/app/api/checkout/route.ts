import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { serverError } from '@/lib/admin';
import { CatalogProduct, parseCheckout, priceOrder, ValidationError } from '@/lib/validation';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(req: NextRequest) {
  const reserved: { productId: string; quantity: number }[] = [];
  try {
    const input = parseCheckout(await req.json().catch(() => null));
    await connectToDatabase();

    const docs = await Product.find({ _id: { $in: input.items.map((i) => i.productId) } }).lean();
    const catalog = new Map<string, CatalogProduct>(docs.map((d: any) => [String(d._id),
      { _id: String(d._id), name: d.name, price: d.price, stock: d.stock, image: d.image }]));
    const { lines, total } = priceOrder(input.items, catalog);

    // Reserve stock atomically: the update only matches if enough stock is left at that instant,
    // so two shoppers can't both buy the last phone.
    for (const line of lines) {
      const ok = await Product.findOneAndUpdate(
        { _id: line.productId, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
      );
      if (!ok) throw new ValidationError(`${line.name} just sold out. Please update your cart.`);
      reserved.push({ productId: line.productId, quantity: line.quantity });
    }

    const order = await Order.create({
      orderNumber: 'PV-' + randomBytes(4).toString('hex').toUpperCase(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      shippingAddress: { address: input.address },
      items: lines,
      total,
      paymentMethod: 'Cash on delivery (demo)',
      status: 'pending',
    });
    return NextResponse.json({ success: true, orderNumber: order.orderNumber, total }, { status: 201 });
  } catch (error) {
    // give back anything reserved before the failure
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })));
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return serverError(error);
  }
}
