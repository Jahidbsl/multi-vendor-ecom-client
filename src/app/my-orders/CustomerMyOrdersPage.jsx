"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, Button, Chip, Pagination, Skeleton } from "@heroui/react";
import {
  PackageCheck,
  Calendar,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getCustomerOrders } from "@/lib/api/orders";
import { createReview } from "@/lib/actions/reviews";
import { toast } from "react-toastify";
import ReviewModal from "@/components/ReviewModal";

export default function CustomerMyOrdersPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUserOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getCustomerOrders({ userId, page, limit: 6 });
      if (res?.success || res?.data) {
        setOrders(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const handleSubmitReview = async () => {
    if (!comment.trim()) return toast.error("Please write a comment.");
    setSubmitting(true);
    try {
      const res = await createReview({
        userId,
        productId:
          selectedProduct?.id ||
          selectedProduct?._id ||
          selectedProduct?.productId,
        orderId: selectedOrderId,
        rating,
        comment,
      });
      if (res?.success) {
        toast.success("Review submitted!");
        setIsOpen(false);
        setComment("");
      } else {
        toast.error(res?.message || "Failed to submit.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <PackageCheck size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">My Orders</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-default-500">
          No orders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const productsList = order.products || order.items || [];

            return (
              <Card
                key={order._id}
                className="p-6 border border-default-200 dark:bg-zinc-900 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-default-100">
                    <span className="text-[10px] font-mono text-default-400 uppercase tracking-wider">
                      #{order.orderId || order._id.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-xs text-default-500 font-medium flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Multiple Products support */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {productsList.map((product, idx) => {
                      const prodTitle = product.title || product.name || "Purchased Item";
                      const prodImage = product.image || "";
                      const prodSize = product.size;
                      const prodColor = product.color;
                      const prodQty = product.quantity || 1;
                      const prodPrice = product.price || 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 p-2 rounded-xl bg-default-50 dark:bg-zinc-800/50 border border-default-100 dark:border-white/5"
                        >
                          <div className="flex gap-3 items-center min-w-0">
                            {prodImage && (
                              <div className="relative aspect-square w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-default-200 dark:border-white/10">
                                <Image
                                  src={prodImage}
                                  alt={prodTitle}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}

                            <div className="flex flex-col gap-0.5 min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[150px]">
                                {prodTitle}
                              </h4>

                              {(prodSize || prodColor) && (
                                <div className="flex items-center gap-1.5 text-[10px] text-default-500">
                                  {prodSize && (
                                    <span className="bg-default-200/60 dark:bg-zinc-700 px-1.5 py-0.2 rounded font-medium">
                                      Size: {prodSize}
                                    </span>
                                  )}
                                  {prodColor && (
                                    <span className="bg-default-200/60 dark:bg-zinc-700 px-1.5 py-0.2 rounded font-medium">
                                      Color: {prodColor}
                                    </span>
                                  )}
                                </div>
                              )}

                              <span className="text-[11px] text-default-400">
                                Qty: {prodQty} x ${prodPrice}
                              </span>
                            </div>
                          </div>

                          {order.status === "delivered" && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              className="font-bold text-[10px] h-7 px-2 shrink-0 self-center"
                              startContent={<MessageSquare size={12} />}
                              onPress={() => {
                                const pid =
                                  product.productId || product._id || product.id;
                                setSelectedProduct({ ...product, id: pid });
                                setSelectedOrderId(order._id);
                                setIsOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-default-100">
                  <div className="flex items-center gap-1 font-extrabold text-base text-foreground">
                    <DollarSign size={16} className="text-amber-500" />
                    <span>{order.totalAmount}</span>
                  </div>

                  <Chip
                    size="sm"
                    variant="flat"
                    color={order.status === "delivered" ? "success" : "warning"}
                  >
                    {order.status}
                  </Chip>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <Pagination total={totalPages} page={page} onChange={setPage} />
        </div>
      )}

      <ReviewModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        product={selectedProduct}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        submitting={submitting}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}