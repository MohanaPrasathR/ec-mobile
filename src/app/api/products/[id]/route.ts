import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { adminGuard, serverError } from '@/lib/admin';
import { productPatch, ValidationError } from '@/lib/validation';
import Product from '@/models/Product';
import * as demo from '@/lib/demoStore';

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return notFound();
    if (demo.isDemoMode()) {
      const found = demo.getProduct(id);
      return found ? NextResponse.json({ success: true, data: found }) : notFound();
    }
    await connectToDatabase();
    const product = await Product.findById(id).lean();
    return product ? NextResponse.json({ success: true, data: product }) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return notFound();
    const patch = productPatch(await request.json().catch(() => null), false);
    if (demo.isDemoMode()) {
      const changed = demo.updateProduct(id, patch);
      return changed ? NextResponse.json({ success: true, data: changed }) : notFound();
    }
    await connectToDatabase();
    const updated = await Product.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true });
    return updated ? NextResponse.json({ success: true, data: updated }) : notFound();
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return serverError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return notFound();
    if (demo.isDemoMode()) return demo.deleteProduct(id) ? NextResponse.json({ success: true }) : notFound();
    await connectToDatabase();
    const deleted = await Product.findByIdAndDelete(id);
    return deleted ? NextResponse.json({ success: true }) : notFound();
  } catch (error) {
    return serverError(error);
  }
}
