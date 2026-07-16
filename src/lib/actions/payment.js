"use server"; // এটি Server Action হিসেবে কাজ করবে

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function verifyPayment(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/payment-success`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    });

    const data = await res.json();
    return data; // { success: true/false, message: ... }
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false, message: "Server connection failed" };
  }
}