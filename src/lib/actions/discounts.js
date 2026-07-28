"use server";

import { revalidatePath } from "next/cache";
import { getUserToken } from "../core/session"; // Apnar session ba token file path onujayi thik kore neben

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

// Helper for headers with Token
const getAuthHeaders = async (hasBody = false) => {
  const token = await getUserToken();
  const headers = {};
  
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Create a discount for a product.
 * payload: { productId, vendorId, discountType, discountValue, startDate?, endDate? }
 */
export async function createDiscountAction(payload) {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch(`${baseUrl}/api/discounts`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      revalidatePath("/dashboard/vendor/discounts");
      revalidatePath("/vendors");
    }

    return data;
  } catch (error) {
    console.error("createDiscountAction error:", error);
    return { success: false, message: "Failed to create discount" };
  }
}

/**
 * Update an existing discount (value, type, dates, or status).
 * payload: { discountType?, discountValue?, startDate?, endDate?, status? }
 */
export async function updateDiscountAction(id, payload) {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      revalidatePath("/dashboard/vendor/discounts");
      revalidatePath("/vendors");
    }

    return data;
  } catch (error) {
    console.error("updateDiscountAction error:", error);
    return { success: false, message: "Failed to update discount" };
  }
}

/**
 * Delete a discount and restore the product's original price.
 */
export async function deleteDiscountAction(id) {
  try {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();

    if (data.success) {
      revalidatePath("/dashboard/vendor/discounts");
      revalidatePath("/vendors");
    }

    return data;
  } catch (error) {
    console.error("deleteDiscountAction error:", error);
    return { success: false, message: "Failed to delete discount" };
  }
}