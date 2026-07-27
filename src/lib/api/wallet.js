// lib/api/wallet.js
import { serverFetch, serverMutation } from "@/lib/core/server";

export const getWalletByVendorId = async (vendorId) => {
  return await serverFetch(`/api/vendor/wallet/${vendorId}`);
};

export const requestWithdrawal = async (withdrawalData) => {
  return await serverMutation("/api/vendor/withdraw-request", withdrawalData);
};