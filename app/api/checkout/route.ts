import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getMollieClientForUser } from '@/lib/mollie';

export async function POST(req: NextRequest) {
  const { productId, customerEmail, customerName } = await req.json();

  if (!productId || !customerEmail) {
    return NextResponse.json({ error: 'Missing productId or customerEmail' }, { status: 400 });
  }

  try {
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productDoc.data();
    const creatorId = product?.creatorId;

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

    const orderRef = db.collection('orders').doc();
    const orderId = orderRef.id;

    const payment = await mollie.payments.create({
      amount: {
        currency: product?.currency,
        value: product?.price.toFixed(2),
      },
      description: `Order for ${product?.title}`,
      redirectUrl: `${process.env.APP_URL}/order/${orderId}`,
      webhookUrl: `${process.env.APP_URL}/api/webhook`,
      metadata: {
        orderId,
        productId,
        creatorId,
      },
    });

    await orderRef.set({
      id: orderId,
      productId,
      creatorId,
      customerEmail,
      customerName: customerName || '',
      amount: product?.price,
      currency: product?.currency,
      status: 'open',
      molliePaymentId: payment.id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
