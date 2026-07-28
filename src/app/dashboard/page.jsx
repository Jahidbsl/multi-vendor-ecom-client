"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { authClient } from "@/lib/auth-client";
import { getProducts } from "@/lib/api/produts";
import { getVendorById } from "@/lib/api/vendors";
import { getWalletByVendorId } from "@/lib/api/wallet";
// Secure server actions import korun
import {
  getAdminProfitSummary,
  getAdminVendors,
  getAdminOrders,
  getVendorOrders,
  getUserOrders,
} from "@/lib/actions/dashboard";

function StatCard({ label, value, delta, positive, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/12 text-amber-500">
          <Icon size={20} />
        </span>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            positive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardContent() {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role || "admin";
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [adminProfitData, setAdminProfitData] = useState({
    totalProfit: 0,
    totalSales: 0,
    totalOrders: 0,
  });
  const [vendorWallet, setVendorWallet] = useState({ balance: 0, totalEarnings: 0 });
  const [activeVendorsCount, setActiveVendorsCount] = useState("0");
  const [listedProductsCount, setListedProductsCount] = useState("0");
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        let fetchedOrders = [];

        if (role === "admin") {
          const profitData = await getAdminProfitSummary();
          if (profitData.success) {
            setAdminProfitData(profitData.data);
          }

          const vendorsData = await getAdminVendors();
          if (vendorsData.success && vendorsData.pagination) {
            setActiveVendorsCount(vendorsData.pagination.totalVendors.toString());
          }

          const ordersData = await getAdminOrders(10);
          if (ordersData.success) {
            fetchedOrders = ordersData.data;
            setRecentOrders(fetchedOrders.slice(0, 5));
          }
        } else if (role === "vendor" && userId) {
          const currentVendor = await getVendorById(userId);
          if (currentVendor && currentVendor.success && currentVendor.data) {
            const vendorData = currentVendor.data;
            const docId = vendorData._id?.$oid || vendorData._id;

            const walletData = await getWalletByVendorId(docId);
            if (walletData?.success && walletData?.data) {
              setVendorWallet(walletData.data);
            }

            const vendorOrdersData = await getVendorOrders(docId, 10);
            if (vendorOrdersData.success) {
              fetchedOrders = vendorOrdersData.data;
              setRecentOrders(fetchedOrders.slice(0, 5));
            }
          }
        } else if (userId) {
          const userOrdersData = await getUserOrders(userId, 5);
          if (userOrdersData.success) {
            fetchedOrders = userOrdersData.data;
            setRecentOrders(fetchedOrders);
          }
        }

        const productsRes = await getProducts();
        if (productsRes) {
          const productsList = Array.isArray(productsRes)
            ? productsRes
            : productsRes.data || productsRes.products || [];
          setListedProductsCount(productsList.length.toString());
        }

        if (fetchedOrders.length > 0) {
          const groupedData = {};
          fetchedOrders.forEach((order) => {
            const date = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", { weekday: "short" });
            if (!groupedData[date]) {
              groupedData[date] = { name: date, revenue: 0, orders: 0 };
            }
            groupedData[date].revenue += order.totalAmount || 0;
            groupedData[date].orders += 1;
          });

          const formattedChart = Object.values(groupedData);
          if (formattedChart.length > 0) {
            setChartData(formattedChart);
          } else {
            setFallbackChart();
          }
        } else {
          setFallbackChart();
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setFallbackChart();
      } finally {
        setLoading(false);
      }
    }

    function setFallbackChart() {
      if (role === "vendor") {
        setChartData([
          { name: "Mon", revenue: 200, orders: 2 },
          { name: "Tue", revenue: 450, orders: 5 },
          { name: "Wed", revenue: 300, orders: 3 },
          { name: "Thu", revenue: 800, orders: 9 },
          { name: "Fri", revenue: 600, orders: 6 },
        ]);
      } else {
        setChartData([
          { name: "Mon", revenue: 1200, orders: 14 },
          { name: "Tue", revenue: 2100, orders: 25 },
          { name: "Wed", revenue: 1800, orders: 19 },
          { name: "Thu", revenue: 3200, orders: 38 },
          { name: "Fri", revenue: 2900, orders: 30 },
        ]);
      }
    }

    fetchDashboardData();
  }, [role, userId]);

  const stats =
    role === "admin"
      ? [
          {
            label: "Platform Revenue",
            value: loading ? "Loading..." : `$${adminProfitData.totalProfit.toLocaleString()}`,
            delta: "+12.4%",
            positive: true,
            icon: DollarSign,
          },
          {
            label: "Total Orders",
            value: loading ? "Loading..." : adminProfitData.totalOrders.toString(),
            delta: "+5.1%",
            positive: true,
            icon: ShoppingCart,
          },
          {
            label: "Active Vendors",
            value: loading ? "Loading..." : activeVendorsCount,
            delta: "+2.3%",
            positive: true,
            icon: Users,
          },
          {
            label: "Listed Products",
            value: loading ? "Loading..." : listedProductsCount,
            delta: "+0.8%",
            positive: true,
            icon: Package,
          },
        ]
      : role === "vendor"
      ? [
          {
            label: "Available Balance",
            value: loading ? "Loading..." : `$${vendorWallet.balance.toFixed(2)}`,
            delta: "+8.9%",
            positive: true,
            icon: DollarSign,
          },
          {
            label: "Total Earnings",
            value: loading ? "Loading..." : `$${vendorWallet.totalEarnings.toFixed(2)}`,
            delta: "+14.2%",
            positive: true,
            icon: TrendingUp,
          },
          {
            label: "Store Products",
            value: loading ? "Loading..." : listedProductsCount,
            delta: "+1 new",
            positive: true,
            icon: Package,
          },
          {
            label: "Store Orders",
            value: loading ? "Loading..." : recentOrders.length.toString(),
            delta: "+3.2%",
            positive: true,
            icon: ShoppingCart,
          },
        ]
      : [
          {
            label: "Total Orders",
            value: loading ? "Loading..." : recentOrders.length.toString(),
            delta: "0%",
            positive: true,
            icon: ShoppingCart,
          },
          {
            label: "Saved Items",
            value: "0",
            delta: "0%",
            positive: true,
            icon: Package,
          },
        ];

  return (
    <div className="space-y-6 p-6 bg-zinc-50 dark:bg-[#0b0a0c] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard Overview ({role.toUpperCase()})
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, {session?.user?.name || "User"}! Here is your performance metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, idx) => (
          <StatCard key={idx} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                {role === "vendor" ? "Store Revenue Analytics" : "Platform Revenue Analytics"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Performance breakdown based on recent orders
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp size={14} /> Active
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Orders Overview
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total orders count
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">
          Recent Orders
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6 text-center">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
              <thead className="border-b border-zinc-200 dark:border-white/10 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-white/[2%] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-white">
                      #{order.orderId || (order._id ? order._id.slice(-6) : "N/A")}
                    </td>
                    <td className="py-3.5 px-4">{order.customerName || order.customerEmail || "N/A"}</td>
                    <td className="py-3.5 px-4">${order.totalAmount || 0}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {order.paymentStatus || "unpaid"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500 capitalize">
                        {order.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}