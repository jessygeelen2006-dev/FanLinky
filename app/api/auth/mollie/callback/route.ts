import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { MOLLIE_TOKEN_URL } from '@/lib/mollie';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This should be the user's uid

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const response = await fetch(MOLLIE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.MOLLIE_CLIENT_ID}:${process.env.MOLLIE_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL}/api/auth/mollie/callback`,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error_description || data.error }, { status: 400 });
    }

    const { access_token, refresh_token, expires_in } = data;

    await db.collection('users').doc(state).update({
      mollieAccessToken: access_token,
      mollieRefreshToken: refresh_token,
      mollieExpiresAt: Date.now() + (expires_in * 1000),
    });

    return NextResponse.redirect(`${process.env.APP_URL}/dashboard?mollie=connected`);
  } catch (error) {
    console.error('Mollie OAuth error:', error);
    return NextResponse.json({ error: 'Failed to connect Mollie' }, { status: 500 });
  }
}
