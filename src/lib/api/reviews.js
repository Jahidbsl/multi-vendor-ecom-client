import { serverFetch } from "../core/server";

export async function getProductReviews(productId) {
  try {
    const res = await serverFetch(`/api/reviewRoutes/product/${productId}`);
    return res || { success: false, data: [] };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, data: [] };
  }
}