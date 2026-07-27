"use server";

import { revalidatePath } from "next/cache";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

/**
 * Create a discount for a product.
 * payload: { productId, vendorId, discountType, discountValue, startDate?, endDate? }
 */
export async function createDiscountAction(payload) {
  try {
    const res = await fetch(`${baseUrl}/api/discounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
      method: "DELETE",
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