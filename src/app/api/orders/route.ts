import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { adminGuard, serverError } from '@/lib/admin';
import Order from '@/models/Order';

/** Order history contains customer names, emails and addresses, so it's admin-only.
 *  Orders are created only through /api/checkout, which prices them on the server. */
export async function GET(req: NextRequest) {
  const denied = adminGuard(req);
  if (denied) return denied;
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return serverError(error);
  }
}
