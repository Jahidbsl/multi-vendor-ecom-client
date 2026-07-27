// lib/actions/payment.js
"use server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function verifyPayment(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/payment-success`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await res.text();
      console.error("Non-JSON response received:", textResponse);
      return { success: false, message: "Invalid server response format (HTML received)" };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false, message: "Server connection failed" };
  }
}