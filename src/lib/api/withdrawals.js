// lib/api/admin-withdrawals.js
"use server";

import { serverFetch, serverPatch } from "../core/server";

export const getAllWithdrawals = async () => {
  try {
    const res = await serverFetch("/api/admin/withdrawals");
    return res || { success: false, data: [] };
  } catch (err) {
    console.error("Error fetching withdrawals:", err);
    return { success: false, data: [] };
  }
};

export const updateWithdrawalStatus = async (id, status) => {
  try {
    const res = await serverPatch(`/api/admin/withdrawals/${id}/status`, { status });
    return res || { success: false, message: "Server error occurred" };
  } catch (err) {
    console.error("Error updating withdrawal status:", err);
    return { success: false, message: err.message || "Server error occurred" };
  }
};