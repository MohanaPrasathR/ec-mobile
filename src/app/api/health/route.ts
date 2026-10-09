import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { isDemoMode } from '@/lib/demoStore';

export const dynamic = 'force-dynamic';

/** Says which store is in use and whether the database answers. Never includes the
 *  connection string or the driver's message, only the kind of failure. */
export async function GET() {
  if (isDemoMode()) return NextResponse.json({ mode: 'demo', database: 'not configured' });
  try {
    await connectToDatabase();
    return NextResponse.json({ mode: 'mongodb', database: 'ok' });
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error';
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const reason = message.includes('auth') ? 'authentication failed'
      : message.includes('whitelist') || message.includes('ip') || name === 'MongooseServerSelectionError' ? 'server not reachable (network access or cluster paused)'
      : message.includes('invalid scheme') || message.includes('uri') ? 'connection string is malformed'
      : 'connection failed';
    return NextResponse.json({ mode: 'mongodb', database: 'unreachable', errorType: name, reason }, { status: 503 });
  }
}
