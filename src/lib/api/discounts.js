import { serverFetch, serverMutation } from "../core/server";


/**
 * Fetch all discounts created by a vendor (for dashboard listing).
 * GET /api/discounts/vendor/:vendorId
 */
export const getVendorDiscounts = async (vendorId) => {
  return await serverFetch(`/api/discounts/vendor/${vendorId}`);
};

/**
 * Fetch the active discount for a single product (for product/store pages).
 * GET /api/discounts/product/:productId
 */
export const getProductDiscount = async (productId) => {
  return await serverFetch(`/api/discounts/product/${productId}`);
};



export async function getAdminDiscounts() {
  try {
    const res = await serverFetch("/api/admin/discounts");
    return res;
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createProductDiscount(data) {
  try {
    const res = await serverMutation("/api/discounts", data); // <-- এখানে data পাস করা হলো
    return res || { success: false, message: "No response from server" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to create discount" };
  }
}

export async function createCategoryDiscount(data) {
  try {
    const res = await serverMutation("/api/admin/discounts/category", data); // <-- এখানেও data পাস করা হলো
    return res || { success: false, message: "No response from server" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to create category discount" };
  }
}

export async function deleteDiscount(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/discounts/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error) {
    return { success: false, message: "Failed to delete discount" };
  }
}