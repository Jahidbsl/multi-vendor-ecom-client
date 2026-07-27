import { serverFetch, serverMutation } from "../core/server";


export async function getBanners(activeOnly = false) {
  try {
    const endpoint = activeOnly ? "/api/banners?active=true" : "/api/banners";
    const res = await serverFetch(endpoint);
    if (!res) return [];
    return res.banners || res.banner || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function createBanner(payload) {
  try {
    // যেহেতু serverMutation(path, data) নেয়, তাই এখানে "POST" লেখার প্রয়োজন নেই
    const res = await serverMutation("/api/banners", payload);
    return res;
  } catch (error) {
    console.error("Error creating banner:", error);
    return { success: false, message: error.message || "Failed to create banner" };
  }
}