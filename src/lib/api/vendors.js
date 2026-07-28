"use server";
import { serverFetch } from "../core/server";

export const getVendorRequests = async (page, limit) => {
  return serverFetch(`/api/vendor-requests?page=${page}&limit=${limit}`);
};

export const getVendors = async (page = 1, limit = 10) => {
  try {
    const res = await serverFetch(`/api/vendors?page=${page}&limit=${limit}`);
    return res;
  } catch (error) {
    throw new Error("Failed to fetch vendors");
  }
};

// 1. Check existing vendor request status
export const checkVendorRequestStatus = async (userId) => {
  return serverFetch(`/api/vendor-request/check/${userId}`);
};

export const getTopVendors = async () => {
  try {
    const res = await serverFetch(`/api/top-vendors`);
    if (!res) {
      throw new Error("Failed to fetch top vendors");
    }
    return res;
  } catch (error) {
    console.error("Error in getTopVendors:", error);
    throw error;
  }
};

/**
 * Fetch a single vendor's store details by id.
 * GET /api/vendors/:id
 */
export const getVendorById = async (id) => {
  return await serverFetch(`/api/vendors/${id}`);
};
 
/**
 * Fetch all products belonging to a vendor.
 * GET /api/products/vendor/:id
 */
export const getVendorProducts = async (id) => {
  return await serverFetch(`/api/products/vendor/${id}`);
};