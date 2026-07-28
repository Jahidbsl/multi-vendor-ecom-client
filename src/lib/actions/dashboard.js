"use server";

import { serverFetch } from "../core/server";

export async function getAdminProfitSummary() {
  try {
    const res = await serverFetch(`/api/admin/profit-summary`);
    return res || { success: false };
  } catch (error) {
    console.error("Error fetching profit summary:", error);
    return { success: false };
  }
}

export async function getAdminVendors() {
  try {
    const res = await serverFetch(`/api/vendors`);
    return res || { success: false };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { success: false };
  }
}

export async function getAdminOrders(limit = 10) {
  try {
    const res = await serverFetch(`/api/admin/orders?limit=${limit}`);
    return res || { success: false };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { success: false };
  }
}

export async function getVendorOrders(vendorId, limit = 10) {
  try {
    const res = await serverFetch(`/api/vendor/orders?vendorId=${vendorId}&limit=${limit}`);
    return res || { success: false };
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return { success: false };
  }
}

export async function getUserOrders(userId, limit = 5) {
  try {
    const res = await serverFetch(`/api/user/orders/${userId}?limit=${limit}`);
    return res || { success: false };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false };
  }
}