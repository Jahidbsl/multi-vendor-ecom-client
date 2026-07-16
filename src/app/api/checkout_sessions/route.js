import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin');

    const body = await req.json();
    const { products, userId } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided for checkout' },
        { status: 400 }
      );
    }

    // Dynamic price_data দিয়ে Stripe line_items ফরম্যাট করা
    const lineItems = products.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100), // Cents conversion
      },
      quantity: item.quantity || 1,
    }));

    // Stripe Checkout Session তৈরি
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: userId || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}