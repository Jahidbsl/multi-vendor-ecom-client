// app/success/page.jsx (Success Page Frontend Component)
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { verifyPayment } from '@/lib/actions/payment';
import { clearUserCart } from '@/lib/actions/cart'; // Server action import kora holo
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  const session_id = params?.session_id;

  if (!session_id) {
    redirect('/');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent'],
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    redirect('/');
  }

  const paymentResult = await verifyPayment(session_id);
  if (!paymentResult.success) {
    console.error('Payment verification failed:', paymentResult.message);
  }

  const { status, customer_details, amount_total, currency, metadata } = session;
  const userId = metadata?.userId;

  if (status !== 'complete') {
    return redirect('/');
  }

  if (userId) {
    try {
      // Server action use koray r URL mismatch ba token error hobe na
      await clearUserCart(userId);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }

  return (
    <div className="min-h-screen bg-default-50/50 dark:bg-zinc-950 text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background border border-default-200 dark:border-white/10 rounded-3xl p-8 shadow-xl space-y-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">Payment Successful!</h1>
          <p className="text-sm text-default-500">
            Thank you for your purchase. Your order is confirmed.
          </p>
        </div>

        <div className="bg-default-100/50 dark:bg-zinc-900/60 rounded-2xl p-4 text-left space-y-3 border border-default-200/50">
          <div className="flex justify-between text-xs text-default-500">
            <span>Status</span>
            <span className="text-emerald-500 font-bold uppercase">Completed</span>
          </div>
          <div className="flex justify-between text-xs text-default-500">
            <span>Amount Paid</span>
            <span className="text-foreground font-extrabold">
              {(amount_total / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })}
            </span>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Link href="/my-orders" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl transition-all">
            <ShoppingBag size={18} /> View My Orders
          </Link>
          <Link href="/" className="w-full inline-flex items-center justify-center text-default-500 font-semibold py-3 text-sm">
            Back to Home <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}