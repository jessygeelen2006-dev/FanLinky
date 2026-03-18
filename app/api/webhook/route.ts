import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getMollieClientForUser } from '@/lib/mollie';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get('id') as string;

  if (!id) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 });
  }

  try {
    const orderDoc = await db.collection('orders').where('molliePaymentId', '==', id).limit(1).get();
    if (orderDoc.empty) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderDoc.docs[0].data();
    const creatorId = order?.creatorId;

    const creatorDoc = await db.collection('users').doc(creatorId).get();
    if (!creatorDoc.exists) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const creator = creatorDoc.data();
    const mollieAccessToken = creator?.mollieAccessToken;

    if (!mollieAccessToken) {
      return NextResponse.json({ error: 'Creator has not connected Mollie' }, { status: 400 });
    }

    const mollie = getMollieClientForUser(mollieAccessToken);
    const payment = await mollie.payments.get(id);

    const status = payment.status;

    await db.collection('orders').doc(order.id).update({
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
