"use server";

import { headers } from "next/headers";
import { serverFetch } from "../core/server";

/**
 * @param {string} userId 
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export async function getCartItems(userId) {
  if (!userId) {
    return {
      success: false,
      data: [],
      message: "User ID is required",
    };
  }

  try {
    const cookieStore = await headers();
    const cookieHeader = cookieStore.get("cookie") || "";
    const authorizationHeader = cookieStore.get("authorization") || "";

    const response = await serverFetch(`/api/cart/${userId}`, {
      method: "GET",
      cache: "no-store", 
      headers: {
        Cookie: cookieHeader,
        ...(authorizationHeader && { Authorization: authorizationHeader }),
      },
    });

    if (response?.success) {
      return {
        success: true,
        data: response.data || [],
        message: "Cart fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response?.message || "Failed to fetch cart items",
    };
  } catch (error) {
    console.error("Error in getCartItems Server Action:", error);
    return {
      success: false,
      data: [],
      message: error.message || "An error occurred while fetching cart",
    };
  }
}