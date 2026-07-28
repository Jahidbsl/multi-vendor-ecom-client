"use server";

import { serverFetch } from "../core/server";

export async function getUserWishlist(userId) {
  if (!userId) {
    return { success: false, data: [], message: "User ID is required" };
  }

  try {
    const response = await serverFetch(`/api/users/${userId}/wishlist`);

    if (response?.success) {
      return {
        success: true,
        data: response.data || [],
        message: "Wishlist fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response?.message || "Failed to fetch wishlist",
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, data: [], message: error.message };
  }
}