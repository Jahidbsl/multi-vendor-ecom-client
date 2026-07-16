import { serverFetch } from '../core/server'; // আপনার প্রজেক্টের serverFetch হেল্পার

/**
 * Stripe Session ID দিয়ে পেমেন্টের তথ্য ফেচ করার ফাংশন
 */
export async function getCheckoutSession(sessionId) {
  try {
    const data = await serverFetch(`/api/checkout/session?session_id=${sessionId}`);
    return data;
  } catch (error) {
    console.error('Error fetching checkout session:', error);
    return { success: false, message: error.message };
  }
}