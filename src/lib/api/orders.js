import { serverFetch } from "../core/server";

/**
 * Fetch vendor orders with pagination & filters
 */
export async function getVendorOrders({ page = 1, limit = 10, status = "all", search = "", vendorId = "" }) {
  const query = new URLSearchParams({ page, limit, status, search, vendorId }).toString();
  return serverFetch(`/api/vendor/orders?${query}`);
}

/**
 * Fetch customer order history
 */
export async function getCustomerOrders({ userId, page = 1, limit = 5 }) {
  const query = new URLSearchParams({ page, limit }).toString();
  return serverFetch(`/api/user/orders/${userId}?${query}`);
}



export async function getAdminOrders({ search = "", status = "all", page = 1, limit = 10 } = {}) {
  try {
    const res = await serverFetch(`/api/admin/orders?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=${limit}`, {
      method: "GET",
      cache: "no-store",
    });
    return res;
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { success: false, data: [] };
  }
}

export async function updateAdminOrderStatus(orderId, status) {
  try {
    const res = await serverFetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: "Failed to update status" };
  }
}