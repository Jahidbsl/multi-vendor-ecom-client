"use server";

import { serverMutation, serverPatch } from "../core/server";

// Create Product
export const createProductAction = async (productData) => {
  return serverMutation("/api/products", productData);
};

// Update Product
export const updateProductAction = async (id, productData) => {
  return serverPatch(`/api/products/${id}`, productData);
};

// Delete Product
export const deleteProductAction = async (id) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";
  try {
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Failed to delete product" };
  }
};

/**
 * Like / Unlike a product
 */
export async function toggleProductLike(productId, userId) {
  try {
    return await serverMutation(`/api/products/${productId}/like`, {
      userId,
    });
  } catch (error) {
    console.error("Error in toggleProductLike:", error);
    return {
      success: false,
      message: error.message || "Failed to update like status",
    };
  }
}

/**
 * Toggle Product Wishlist / Favorite
 */
export async function toggleProductWishlist(productId, userId) {
  try {
    return await serverMutation(`/api/products/${productId}/wishlist`, {
      userId,
    });
  } catch (error) {
    console.error("Error in toggleProductWishlist:", error);
    return {
      success: false,
      message: error.message || "Failed to update wishlist status",
    };
  }
}

/**
 * Submit Product Report
 */
export async function submitProductReport(reportPayload) {
  try {
    return await serverMutation("/api/reports", reportPayload);
  } catch (error) {
    console.error("Error in submitProductReport:", error);
    return {
      success: false,
      message: error.message || "Failed to submit report",
    };
  }
}

/**
 * Add Product to Cart
 */
export async function addToCart(cartPayload) {
  try {
    return await serverMutation("/api/cart", cartPayload);
  } catch (error) {
    console.error("Error in addToCart:", error);
    return {
      success: false,
      message: error.message || "Failed to add product to cart",
    };
  }
}