"use server";

import { serverFetch } from "../core/server";


export const getVendorRequests = async (page, limit) => {
  return serverFetch(`/api/vendor-requests?page=${page}&limit=${limit}`);
};