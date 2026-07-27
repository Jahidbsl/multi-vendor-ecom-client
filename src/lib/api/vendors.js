"use server";

import { serverFetch } from "../core/server";


export const getVendorRequests = async (page, limit) => {
  return serverFetch(`/api/vendor-requests?page=${page}&limit=${limit}`);
};

export const getVendors = async (page = 1, limit = 10) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/vendors?page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch vendors");
  return res.json();
};



// 1. Check existing vendor request status
export const checkVendorRequestStatus = async (userId) => {
  return serverFetch(`/api/vendor-request/check/${userId}`);
};

export const getTopVendors = async () => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/top-vendors`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // রেসপন্সটি JSON হিসেবে পার্স করার চেষ্টা করুন
    const data = await res.json();

    if (!res.ok) {
      // যদি সার্ভার থেকে এরর আসে, তবে তা থ্রো করুন
      throw new Error(data.message || "Failed to fetch top vendors");
    }

    return data;
  } catch (error) {
    console.error("Error in getTopVendors:", error);
    // কলিং কম্পোনেন্টে এরর পাঠানোর জন্য আবার থ্রো করুন
    throw error;
  }
};



//  * Fetch a single vendor's store details by id.
//  * GET /api/vendors/:id
//  */
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