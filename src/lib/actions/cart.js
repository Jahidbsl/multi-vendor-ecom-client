"use server";

import { serverFetch, serverPatch, serverDelete } from "../core/server";

export async function getCartItems(userId) {
  if (!userId) {
    return {
      success: false,
      data: [],
      message: "User ID is required",
    };
  }

  try {
    const response = await serverFetch(`/api/cart/${userId}`);

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

export async function updateCartQuantity(cartId, quantity) {
  try {
    const result = await serverPatch(`/api/cart/${cartId}`, { quantity });
    return result || { success: false, message: "Failed to update quantity" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function removeCartItem(cartId) {
  try {
    const result = await serverDelete(`/api/cart/${cartId}`);
    return result || { success: false, message: "Failed to remove item" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function clearUserCart(userId) {
  try {
    const result = await serverDelete(`/api/cart/user/${userId}`);
    return result || { success: false, message: "Failed to clear cart" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}