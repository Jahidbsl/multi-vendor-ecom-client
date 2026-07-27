// lib/api/admin-withdrawals.js

export const getAllWithdrawals = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/withdrawals`);
    const text = await res.text();
    
    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new Error(`Expected JSON but got:\n${text}`);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("Error fetching withdrawals:", err);
    return { success: false, data: [] };
  }
};

export const updateWithdrawalStatus = async (id, status) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/withdrawals/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const text = await res.text();

    console.log("URL:", `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/withdrawals/${id}/status`);
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Body:", text);

    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new Error(`Expected JSON but got:\n${text}`);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("Error updating withdrawal status:", err);
    return { success: false, message: "Server error occurred" };
  }
};