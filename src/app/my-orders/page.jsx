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
          selectedProduct.id ||
          selectedProduct._id ||
          selectedProduct.productId,
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
            const product = order.products?.[0];
            return (
              <Card
                key={order._id}
                className="p-6 border border-default-200 dark:bg-zinc-900 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  {product?.image && (
                    <div className="relative aspect-square w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      <Image
                        src={product.image}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[10px] font-mono text-default-400 uppercase tracking-wider">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-base text-foreground truncate">
                      {product?.name || "Purchased Item"}
                    </h3>
                    <p className="text-xs text-default-500 font-medium flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-default-100">
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <DollarSign size={14} />
                    <span>{order.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        order.status === "delivered" ? "success" : "warning"
                      }
                    >
                      {order.status}
                    </Chip>

                    {order.status === "delivered" && (
                      <Button
                        size="sm"
                        variant="shadow"
                        color="primary"
                        className="font-bold text-xs"
                        startContent={<MessageSquare size={14} />}
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
