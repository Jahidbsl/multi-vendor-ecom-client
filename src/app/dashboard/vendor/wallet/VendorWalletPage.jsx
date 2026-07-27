"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { getVendorById } from "@/lib/api/vendors";
import { getWalletByVendorId, requestWithdrawal } from "@/lib/api/wallet";

export default function VendorWalletPage() {
  const { data: session } = useSession();
  const [vendorId, setVendorId] = useState(null);
  const [shopName, setShopName] = useState("");
  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [accountDetails, setAccountDetails] = useState("");
  const [message, setMessage] = useState("");

  // Reusable wallet fetcher for auto-loading and refreshing
  const fetchWalletData = useCallback(async (id) => {
    if (!id) return;
    try {
      const walletData = await getWalletByVendorId(id);
      if (walletData?.success && walletData?.data) {
        setWallet(walletData.data);
      }
    } catch (err) {
      console.error("Error auto-loading wallet:", err);
    }
  }, []);

  // Auto-load vendor and wallet data on session change/mount
  useEffect(() => {
    async function resolveVendorAndWallet() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const currentVendor = await getVendorById(session.user.id);

        if (currentVendor && currentVendor.success && currentVendor.data) {
          const vendorData = currentVendor.data;
          const docId = vendorData._id?.$oid || vendorData._id;
          
          setVendorId(docId);
          setShopName(vendorData.shopName || "Vendor Shop");

          // Automatically fetch wallet data using the resolved vendor ID
          await fetchWalletData(docId);
        }
      } catch (err) {
        console.error("Error loading vendor profile:", err);
      } finally {
        setLoading(false);
      }
    }

    resolveVendorAndWallet();
  }, [session, fetchWalletData]);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!vendorId) {
      setMessage("Vendor ID not found.");
      return;
    }

    try {
      const payload = {
        vendorId,
        amount: Number(amount),
        paymentMethod,
        accountDetails,
      };

      const data = await requestWithdrawal(payload);

      if (data?.success) {
        setMessage("Withdrawal request submitted successfully!");
        setAmount("");
        setAccountDetails("");
        
        // Instant auto-reload wallet data after successful withdrawal request
        fetchWalletData(vendorId);
      } else {
        setMessage(data?.message || "Failed to submit request.");
      }
    } catch (err) {
      setMessage("Server error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-gray-600 dark:text-gray-300 font-medium">Loading wallet...</div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">You are not registered as a vendor or your profile was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vendor Wallet</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your earnings and request payouts</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Shop: {shopName}</span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/10">
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Available Balance</p>
              <p className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">${wallet.balance.toFixed(2)}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 text-white p-6 rounded-2xl shadow-lg shadow-emerald-500/10">
            <div className="relative z-10">
              <p className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Total Earnings</p>
              <p className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">${wallet.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Withdrawal Request Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Request Withdrawal</h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium transition-all ${
              message.includes("successfully") 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900" 
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleWithdrawRequest} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Bkash / Nagad">Bkash / Nagad</option>
                  <option value="Stripe">Stripe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Details (Bank/Phone No)</label>
              <textarea
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm resize-none"
                rows="3"
                placeholder="Enter account number or details..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm"
            >
              Submit Request
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}