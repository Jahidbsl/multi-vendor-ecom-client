"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Button } from "@heroui/react";
import { toast } from "react-toastify";
import { getVendorRequests } from "@/lib/api/vendors";
import { AdminUpdateVendorRequestStatus } from "@/lib/actions/vendors";

export function AdminVendorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [pagination, setPagination] = useState({
    totalRequests: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const fetchRequests = useCallback(async (page) => {
    try {
      setIsLoading(true);
      const data = await getVendorRequests(page, pagination.limit);

      if (data.success) {
        setRequests(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to fetch vendor requests.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(pagination.currentPage);
  }, [fetchRequests, pagination.currentPage]);

  const handleStatusChange = async (id, status) => {
    try {
      setActionLoadingId(id);
      // Make a PATCH request to update the status of the vendor request
      //data

      const data = await AdminUpdateVendorRequestStatus(id, status);

      if (data.success) {
        toast.success(data.message);
        fetchRequests(pagination.currentPage);
      } else {
        toast.error(data.message || "Action failed.");
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
        <h1 className="text-2xl font-bold text-foreground">Vendor Requests</h1>
        <p className="text-sm text-default-500">
          Review and manage pending shop owner applications
        </p>
      </div>

      <div className="rounded-xl border border-default-200 bg-background shadow-sm overflow-hidden">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Vendor Applications Table"
              className="min-w-[800px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>Applicant</Table.Column>
                <Table.Column>Shop Name</Table.Column>
                <Table.Column>Category</Table.Column>
                <Table.Column>Phone</Table.Column>
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
                      Loading applications...
                    </Table.Cell>
                  </Table.Row>
                ) : requests.length === 0 ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={6}
                      className="text-center py-8 text-default-500"
                    >
                      No vendor requests found.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  requests.map((item) => (
                    <Table.Row key={item._id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {item.userName}
                          </span>
                          <span className="text-xs text-default-500">
                            {item.userEmail}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="font-medium text-foreground">
                        {item.shopName}
                      </Table.Cell>

                      <Table.Cell className="capitalize text-default-600">
                        {item.category?.replace("_", " ")}
                      </Table.Cell>

                      <Table.Cell className="text-default-600">
                        {item.phone}
                      </Table.Cell>

                      <Table.Cell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : item.status === "rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {item.status?.toUpperCase()}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {item.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                isLoading={actionLoadingId === item._id}
                                isDisabled={actionLoadingId !== null}
                                onClick={() =>
                                  handleStatusChange(item._id, "approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
                                isLoading={actionLoadingId === item._id}
                                isDisabled={actionLoadingId !== null}
                                onClick={() =>
                                  handleStatusChange(item._id, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-default-400 italic">
                              No actions
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {/* Server-Side Pagination Controls */}
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
