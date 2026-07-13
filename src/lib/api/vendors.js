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