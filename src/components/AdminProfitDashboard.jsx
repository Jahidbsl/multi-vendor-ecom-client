"use client";
import React, { useState, useEffect } from "react";
// Age toiri kora dashboard server action import korun
import { getAdminProfitSummary } from "@/lib/actions/dashboard";

export default function AdminProfitDashboard() {
  const [profitData, setProfitData] = useState({ totalProfit: 0, totalSales: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminProfit() {
      try {
        // Direct fetch er bodole server action use kora hocche jate cookie/token forward hoy
        const res = await getAdminProfitSummary();
        if (res && res.success) {
          setProfitData(res.data);
        }
      } catch (err) {
        console.error("Error fetching profit data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminProfit();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading profit analytics...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Revenue & Profit Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* টোটাল প্রফিট কার্ড */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm uppercase tracking-wider font-medium text-purple-200">Total Admin Profit</h3>
          <p className="text-3xl font-extrabold mt-2">${profitData.totalProfit?.toFixed(2) || "0.00"}</p>
        </div>

        {/* টোটাল সেলস ভলিউম */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 text-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm uppercase tracking-wider font-medium text-blue-200">Total Sales Volume</h3>
          <p className="text-3xl font-extrabold mt-2">${profitData.totalSales?.toFixed(2) || "0.00"}</p>
        </div>

        {/* কমপ্লিটেড অর্ডার */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm uppercase tracking-wider font-medium text-emerald-200">Successful Orders</h3>
          <p className="text-3xl font-extrabold mt-2">{profitData.totalOrders || 0}</p>
        </div>
      </div>
    </div>
  );
}