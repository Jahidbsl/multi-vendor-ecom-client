"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Button, Avatar } from "@heroui/react";
import { toast } from "react-toastify";
import { getVendors } from "@/lib/api/vendors";
import { AdminUpdateVendorStatus } from "@/lib/actions/vendors";

export function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [pagination, setPagination] = useState({
    totalVendors: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const getItemId = (item) => {
    if (!item?._id) return "";
    return typeof item._id === "object" && item._id.$oid
      ? item._id.$oid
      : item._id.toString();
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const rawDate =
      typeof dateValue === "object" && dateValue.$date
        ? dateValue.$date
        : dateValue;

    return new Date(rawDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchVendorsList = useCallback(
    async (page) => {
      try {
        setIsLoading(true);
        const data = await getVendors(page, pagination.limit);

        if (data.success) {
          setVendors(data.data);
          setPagination(data.pagination);
        } else {
          toast.error(data.message || "Failed to fetch vendors.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error connecting to server.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchVendorsList(pagination.currentPage);
  }, [fetchVendorsList, pagination.currentPage]);

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === "blocked" ? "active" : "blocked";

    try {
      setActionLoadingId(id);
      const data = await AdminUpdateVendorStatus(id, nextStatus);

      if (data?.success) {
        toast.success(data.message);
        fetchVendorsList(pagination.currentPage);
      } else {
        toast.error(data?.message || "Action failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Manage Vendors</h1>
        <p className="text-sm text-default-500">
          View, block, or unblock registered store vendors
        </p>
      </div>

      <div className="rounded-xl border border-default-200 bg-background shadow-sm overflow-hidden">
        <Table className="rounded-xl rounded-b-none">
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Vendors Management Table"
              className="min-w-[900px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>Vendor Info</Table.Column>
                <Table.Column>Shop Name</Table.Column>
                <Table.Column>Phone</Table.Column>
                <Table.Column>Joined Date</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>

              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={6}
                      className="text-center py-8 text-default-500"
                    >
                      Loading vendors...
                    </Table.Cell>
                  </Table.Row>
                ) : vendors.length === 0 ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={6}
                      className="text-center py-8 text-default-500"
                    >
                      No vendors found.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  vendors.map((item) => {
                    const vendorId = getItemId(item);
                    const isBlocked = item.status === "blocked";

                    return (
                      <Table.Row key={vendorId}>
                        {/* Vendor User Info */}
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={item.image || item.userAvatar}
                              name={item.name || item.userName}
                              className="w-9 h-9 border border-default-200 shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {item.name || item.userName}
                              </span>
                              <span className="text-xs text-default-500">
                                {item.email || item.userEmail}
                              </span>
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Shop Info */}
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {item.shopImage && (
                              <Avatar
                                src={item.shopImage}
                                name={item.shopName}
                                className="w-8 h-8 rounded-md shrink-0 border border-default-200"
                              />
                            )}
                            <span className="font-medium text-foreground">
                              {item.shopName || "N/A"}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Phone */}
                        <Table.Cell className="text-default-600">
                          {item.phone || "N/A"}
                        </Table.Cell>

                        {/* Joined Date */}
                        <Table.Cell className="text-xs text-default-500">
                          {formatDate(item.createdAt)}
                        </Table.Cell>

                        {/* Status Badge */}
                        <Table.Cell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isBlocked
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {isBlocked ? "BLOCKED" : "ACTIVE"}
                          </span>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell>
                          <Button
                            size="sm"
                            className={
                              isBlocked
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                : "bg-rose-600 hover:bg-rose-700 text-white font-medium"
                            }
                            isLoading={actionLoadingId === vendorId}
                            isDisabled={actionLoadingId !== null}
                            onClick={() =>
                              handleStatusToggle(vendorId, item.status)
                            }
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-default-200 bg-default-50/50 dark:bg-default-100/10">
          <span className="text-sm text-default-500">
            Page {pagination.currentPage} of {pagination.totalPages || 1}
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isDisabled={pagination.currentPage <= 1 || isLoading}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              isDisabled={
                pagination.currentPage >= pagination.totalPages || isLoading
              }
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}