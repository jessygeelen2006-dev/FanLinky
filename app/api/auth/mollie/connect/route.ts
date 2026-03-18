import { NextRequest, NextResponse } from 'next/server';
import { getMollieAuthUrl } from '@/lib/mollie';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const authUrl = getMollieAuthUrl(uid);
  return NextResponse.redirect(authUrl);
}
