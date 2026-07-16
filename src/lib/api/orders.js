import { serverFetch } from "../core/server";

/**
 * Fetch vendor orders with pagination & filters
 */
export async function getVendorOrders({ page = 1, limit = 10, status = "all", search = "" }) {
  const query = new URLSearchParams({ page, limit, status, search }).toString();
  return serverFetch(`/api/vendor/orders?${query}`);
}

/**
 * Fetch customer order history
 */
export async function getCustomerOrders({ userId, page = 1, limit = 5 }) {
  const query = new URLSearchParams({ page, limit }).toString();
  return serverFetch(`/api/user/orders/${userId}?${query}`);
}