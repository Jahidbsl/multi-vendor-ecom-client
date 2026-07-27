// components/AdminOrders.jsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert } from "@heroui/react";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api/orders";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alertInfo, setAlertInfo] = useState({ visible: false, message: "", color: "success" });
  const [isPending, startTransition] = useTransition();

  const limit = 10;

  const loadOrders = async () => {
    setLoading(true);
    const result = await getAdminOrders({ search, status: statusFilter, page, limit });
    if (result && result.success) {
      setOrders(result.data);
      setTotalPages(result.pagination?.totalPages || 1);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, page]);

  const handleStatusChange = (orderId, newStatus) => {
    startTransition(async () => {
      const res = await updateAdminOrderStatus(orderId, newStatus);
      if (res.success) {
        setAlertInfo({ visible: true, message: "Order status updated successfully!", color: "success" });
        loadOrders();
      } else {
        setAlertInfo({ visible: true, message: res.message || "Failed to update status.", color: "danger" });
      }
      setTimeout(() => setAlertInfo((prev) => ({ ...prev, visible: false })), 4000);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      
      {/* Alert Notification */}
      {alertInfo.visible && (
        <div className="mb-4">
          <Alert color={alertInfo.color} title={alertInfo.message} />
        </div>
      )}

      {/* Header & Filters Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Manage All Orders
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Order ID / Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {order.orderId || order._id.slice(-6)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      <div className="font-medium">{order.customerName || order.customer?.name || "N/A"}</div>
                      <div className="text-xs text-gray-400">{order.customerEmail || order.customer?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-semibold">
                      ${order.totalAmount || order.total || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium uppercase inline-block
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={isPending}
                        className="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}