import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Store-management endpoints (add/edit/delete phones, list all orders) need the admin key
 * in the `x-admin-key` header. If ADMIN_API_KEY isn't configured, those endpoints are disabled.
 */
export function adminGuard(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json({ success: false, error: 'Admin actions are disabled (ADMIN_API_KEY not set).' }, { status: 403 });
  }
  const given = Buffer.from(req.headers.get('x-admin-key') ?? '');
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return NextResponse.json({ success: false, error: 'Admin key required.' }, { status: 401 });
  }
  return null;
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
}
