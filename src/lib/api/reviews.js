const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getProductReviews(productId) {
  try {
    const res = await fetch(`${BASE_URL}/api/reviewRoutes/product/${productId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, data: [] };
  }
}