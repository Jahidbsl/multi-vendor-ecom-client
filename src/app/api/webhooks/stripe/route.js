import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // পেমেন্ট সফল হওয়ার ইভেন্ট
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (userId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
        
        // আপনার ব্যাকএন্ডের কার্ট ডিলিট API কল করুন
        await fetch(`${baseUrl}/api/cart/user/${userId}`, {
          method: 'DELETE',
        });
        
        console.log(`Cart cleared successfully for user: ${userId}`);
      } catch (error) {
        console.error('Failed to clear cart in webhook:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}