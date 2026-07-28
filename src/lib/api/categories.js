import { serverFetch, serverMutation, serverDelete } from "@/lib/core/server";

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
  try {
    // serverDelete helper use korle automatic token ebong error handling hoye jabe
    const res = await serverDelete(`/api/admin/categories/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: error.message || "Failed to delete category" };
  }
}