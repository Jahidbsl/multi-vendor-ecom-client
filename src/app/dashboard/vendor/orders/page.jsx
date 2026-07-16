"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Table,
  Input,
  Button,
  Chip,
  Card,
  Pagination,
  Tabs,
} from "@heroui/react";
import { Search, Package } from "lucide-react";
import { getVendorOrders } from "@/lib/api/orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "react-toastify";

const statusColorMap = {
  delivered: "success",
  shipped: "primary",
  pending: "warning",
  cancelled: "danger",
};
const paymentStatusColorMap = {
  paid: "success",
  unpaid: "danger",
  refunded: "warning",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendorOrders({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      if (res?.success) {
        setOrders(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        toast.error(res?.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
      toast.error("Network error while loading orders.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus({ orderId, status: newStatus });
      if (res?.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Error updating order status");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Vendor Order Management
        </h1>
        <p className="text-sm text-default-500">
          Track and fulfill client orders efficiently.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => {
            setStatusFilter(String(key));
            setPage(1);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Order Status Options">
              <Tabs.Tab id="all">
                All
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="pending">
                Pending
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="shipped">
                Shipped
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="delivered">
                Delivered
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="cancelled">
                Cancelled
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 z-10 pointer-events-none"
          />
          <Input
            placeholder="Search Order ID or Customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            radius="lg"
          />
        </div>
      </div>

      <Card className="border border-default-200 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Vendor Orders Table">
              <Table.Header>
                <Table.Column isRowHeader>ORDER ID</Table.Column>
                <Table.Column>CUSTOMER</Table.Column>
                <Table.Column>DATE</Table.Column>
                <Table.Column>ITEMS</Table.Column>
                <Table.Column>AMOUNT</Table.Column>
                <Table.Column>PAYMENT</Table.Column>
                <Table.Column>STATUS</Table.Column>
                <Table.Column align="end">CHANGE STATUS</Table.Column>
              </Table.Header>
              <Table.Body>
                {orders.length === 0 && !loading ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={7}
                      className="text-center py-12 text-default-400"
                    >
                      <Package size={36} className="mx-auto mb-2 opacity-50" />
                      No orders found.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  orders.map((order) => {
                    const productItems = order.products || order.items || [];
                    const firstProduct = productItems[0];
                    const currentStatus = (
                      order.status || "pending"
                    ).toLowerCase();

                    return (
                      <Table.Row key={order._id || order.id}>
                        <Table.Cell className="font-mono text-xs font-semibold">
                          {order.orderId || order._id}
                        </Table.Cell>
                        <Table.Cell>
                          <p className="font-medium text-sm">
                            {order.customerName ||
                              order.customer?.name ||
                              "Customer"}
                          </p>
                          <p className="text-xs text-default-400">
                            {order.customerEmail ||
                              order.customer?.email ||
                              "-"}
                          </p>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-default-500 whitespace-nowrap">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : order.date}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-default-100 border border-default-200 shrink-0">
                              <Image
                                src={firstProduct?.image || "/placeholder.png"}
                                alt={firstProduct?.title || "Product"}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium line-clamp-1 max-w-[150px]">
                                {firstProduct?.title || "Product Item"}
                              </span>
                              <span className="text-[10px] text-default-400">
                                {productItems.length > 1
                                  ? `+${productItems.length - 1} more item(s)`
                                  : `Qty: ${firstProduct?.quantity || 1}`}
                              </span>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="font-bold text-sm text-amber-500">
                          $
                          {(
                            parseFloat(order.totalAmount || order.total) || 0
                          ).toFixed(2)}
                        </Table.Cell>
                        <Table.Cell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              paymentStatusColorMap[
                                order.paymentStatus?.toLowerCase()
                              ] || "default"
                            }
                            className="capitalize font-semibold"
                          >
                            {order.paymentStatus || "Unpaid"}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={statusColorMap[currentStatus] || "default"}
                            className="capitalize font-semibold min-w-max px-3 whitespace-nowrap"
                          >
                            {order.status || "Pending"}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end min-w-[140px]">
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  order._id || order.id,
                                  e.target.value,
                                )
                              }
                              className="h-9 px-3 text-xs font-medium capitalize rounded-lg bg-default-100 dark:bg-zinc-800 border border-default-200 dark:border-zinc-700 text-foreground cursor-pointer outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <div className="flex justify-center p-4 border-t border-default-100">
              <Pagination
                page={page}
                total={totalPages}
                onChange={setPage}
                size="sm"
                radius="full"
                color="amber"
              />
            </div>
          </Table.Footer>
        </Table>
      </Card>
    </div>
  );
}
