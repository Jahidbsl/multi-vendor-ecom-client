"use server";
import { serverFetch, serverPatch } from "../core/server";

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
export async function getProducts(page = 1, limit = 10000, search = "", category = "") {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (category && category !== "All departments") params.append("category", category);

    const response = await serverFetch(`/api/products?${params.toString()}`);

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
 */
export async function getTopSellingProducts(limit = 8) {
  try {
    const response = await serverFetch(`/api/products/top-selling?limit=${limit}`);

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

// admin products manage
export async function getAdminProducts({ search = "", page = 1, limit = 10 } = {}) {
  try {
    const endpoint = `/api/admin/products?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
    
    const data = await serverFetch(endpoint);

    if (!data) {
      return { success: false, data: [], pagination: { totalPages: 1 } };
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    return { success: false, data: [], pagination: { totalPages: 1 } };
  }
}

// Admin toggle featured product (serverPatch use kora holo jate automatic token pass hoy)
export async function adminToggleFeaturedProduct(productId, hasfeature) {
  try {
    const res = await serverPatch(`/api/admin/products/${productId}/featured`, { hasfeature });
    return res;
  } catch (error) {
    console.error("Failed to toggle featured product:", error);
    return { success: false, message: error.message || "Failed to toggle feature status" };
  }
}