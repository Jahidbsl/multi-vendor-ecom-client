import { serverFetch, serverMutation } from "@/lib/core/server";

export async function getAdminCategories() {
  try {
    const res = await serverFetch("/api/admin/categories");
    
    if (res && Array.isArray(res.data)) {
      return { success: true, data: res.data };
    } else if (Array.isArray(res)) {
      return { success: true, data: res };
    }
    return res || { success: false, data: [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [] };
  }
}

export async function addAdminCategory(categoryData) {
  try {
    const res = await serverMutation("/api/admin/categories", categoryData);
    return res || { success: false, message: "No response from server" };
  } catch (error) {
    console.error("Error adding category:", error);
    return { success: false, message: error.message || "Failed to add category" };
  }
}

export async function deleteAdminCategory(id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/categories/${id}`;
  try {
    const res = await fetch(url, {
      method: "DELETE",
    });

    const text = await res.text();
    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new Error(`Expected JSON but got:\n${text}`);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: error.message || "Failed to delete category" };
  }
}