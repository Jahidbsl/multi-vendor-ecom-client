"use server";
import { serverFetch } from "../core/server";

// Get Paginated Products
export const getVendorProductsAction = async (vendorId, page = 1, limit = 8) => {
  return serverFetch(`/api/vendor/products/${vendorId}?page=${page}&limit=${limit}`);
};


export async function getProductById(id) {
  const res = await serverFetch(`/api/products/${id}`);
  return res.success ? res.data : null;
}

/**
 * Fetch products list with pagination
 */
export async function getProducts(page = 1, limit = 9) {
  try {
    const response = await serverFetch(`/api/products?page=${page}&limit=${limit}`, {
      method: "GET",
      cache: "no-store",
    });

    if (response?.success) {
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || null,
        message: "Products fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response?.message || "Failed to fetch products",
    };
  } catch (error) {
    console.error("Error in getProducts:", error);
    return {
      success: false,
      data: [],
      message: error.message || "Network error fetching products",
    };
  }
}

/**
 * Fetch top selling products, ranked by units sold.
 * Expects the backend to expose GET /api/products/top-selling?limit=
 * returning products sorted by soldCount/totalSold descending.
 */
export async function getTopSellingProducts(limit = 8) {
  try {
    const response = await serverFetch(`/api/products/top-selling?limit=${limit}`, {
      method: "GET",
      cache: "no-store",
    });

    if (response?.success) {
      return {
        success: true,
        data: response.data || [],
        usedFallback: response.usedFallback || false,
        message: "Top selling products fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response?.message || "Failed to fetch top selling products",
    };
  } catch (error) {
    console.error("Error in getTopSellingProducts:", error);
    return {
      success: false,
      data: [],
      message: error.message || "Network error fetching top selling products",
    };
  }
}