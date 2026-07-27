"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Button, Input } from "@heroui/react";
import { Tag, X, Percent, DollarSign, Loader2, Calendar } from "lucide-react";
import { getVendorProductsAction } from "@/lib/api/produts";
import { getVendorDiscounts } from "@/lib/api/discounts";
import {
  createDiscountAction,
  deleteDiscountAction,
} from "@/lib/actions/discounts";
import { authClient } from "@/lib/auth-client";

export default function VendorDiscountsPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const vendorId = session?.user?.id;

  const [products, setProducts] = useState([]);
  const [discountsByProduct, setDiscountsByProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openFormId, setOpenFormId] = useState(null);
  
  // ফর্ম স্টেটে endDate যুক্ত করা হলো
  const [formState, setFormState] = useState({
    type: "percentage",
    value: "",
    endDate: "",
  });
  
  const [submittingId, setSubmittingId] = useState(null);

  const loadData = useCallback(async () => {
    if (!vendorId) return;

    try {
      setIsLoading(true);

      const productsRes = await getVendorProductsAction(vendorId);

      if (!productsRes?.success) {
        toast.error(productsRes?.message || "Failed to load products");
        setProducts([]);
        return;
      }

      const vendorProducts = productsRes.data || [];
      setProducts(vendorProducts);

      const discountsRes = await getVendorDiscounts(vendorId);

      if (discountsRes?.success) {
        const map = {};
        for (const discount of discountsRes.data || []) {
          if (discount.status === "active") {
            map[discount.productId] = discount;
          }
        }
        setDiscountsByProduct(map);
      }
    } catch (error) {
      console.error("Failed to load discount dashboard data:", error);
      toast.error("Something went wrong loading your products");
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    if (isSessionLoading) return;

    if (!vendorId) {
      setIsLoading(false);
      return;
    }

    loadData();
  }, [isSessionLoading, vendorId, loadData]);

  const openForm = (productId) => {
    setOpenFormId(productId);
    setFormState({ type: "percentage", value: "", endDate: "" });
  };

  const closeForm = () => {
    setOpenFormId(null);
    setFormState({ type: "percentage", value: "", endDate: "" });
  };

  const handleCreateDiscount = async (product) => {
    const value = Number(formState.value);

    if (!formState.value || Number.isNaN(value) || value <= 0) {
      toast.error("Enter a valid discount amount");
      return;
    }

    if (formState.type === "percentage" && value > 100) {
      toast.error("Percentage discount can't exceed 100");
      return;
    }

    const productId = product._id;

    try {
      setSubmittingId(productId);

      const result = await createDiscountAction({
        productId,
        vendorId: product.vendorId || vendorId,
        discountType: formState.type,
        discountValue: value,
        endDate: formState.endDate ? new Date(formState.endDate).toISOString() : null, // ডেডলাইন পাস করা হচ্ছে
      });

      if (result?.success) {
        toast.success("Discount applied successfully");
        closeForm();
        await loadData();
      } else {
        toast.error(result?.message || "Failed to apply discount");
      }
    } catch (error) {
      console.error("Create discount error:", error);
      toast.error("Failed to apply discount");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRemoveDiscount = async (discount) => {
    try {
      setSubmittingId(discount.productId);

      const result = await deleteDiscountAction(discount._id);

      if (result?.success) {
        toast.success("Discount removed");
        await loadData();
      } else {
        toast.error(result?.message || "Failed to remove discount");
      }
    } catch (error) {
      console.error("Delete discount error:", error);
      toast.error("Failed to remove discount");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0b0d] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Tag className="text-amber-500" size={26} />
            Manage Discounts
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Apply a discount with an optional deadline to any of your products.
          </p>
        </div>

        {isSessionLoading || isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141316] animate-pulse"
              />
            ))}
          </div>
        ) : !vendorId ? (
          <div className="text-center py-16 bg-white dark:bg-[#141316] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Tag className="mx-auto text-zinc-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Not Signed In
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Sign in as a vendor to manage discounts.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141316] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Tag className="mx-auto text-zinc-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              No Products Yet
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Add a product before you can create a discount for it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const discount = discountsByProduct[product._id];
              const isFormOpen = openFormId === product._id;
              const isSubmitting = submittingId === product._id;

              return (
                <div
                  key={product._id}
                  className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                        {product.title || product.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {discount ? (
                          <>
                            <span className="text-sm text-zinc-400 line-through">
                              ${discount.originalPrice}
                            </span>
                            <span className="text-sm font-bold text-amber-500">
                              ${discount.discountedPrice}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                              {discount.discountType === "percentage"
                                ? `${discount.discountValue}% off`
                                : `$${discount.discountValue} off`}
                            </span>
                            {discount.endDate && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                <Calendar size={10} />
                                Ends: {new Date(discount.endDate).toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {discount ? (
                        <Button
                          size="sm"
                          variant="flat"
                          isDisabled={isSubmitting}
                          onClick={() => handleRemoveDiscount(discount)}
                          className="text-red-500"
                        >
                          {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Remove Discount
                        </Button>
                      ) : isFormOpen ? (
                        <Button size="sm" variant="flat" onClick={closeForm}>
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openForm(product._id)}
                          className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold"
                        >
                          Add Discount
                        </Button>
                      )}
                    </div>
                  </div>

                  {isFormOpen && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-wrap">
                      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((s) => ({ ...s, type: "percentage" }))
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            formState.type === "percentage"
                              ? "bg-white dark:bg-[#141316] text-amber-500 shadow-sm"
                              : "text-zinc-500"
                          }`}
                        >
                          <Percent size={12} />
                          Percent
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((s) => ({ ...s, type: "flat" }))
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            formState.type === "flat"
                              ? "bg-white dark:bg-[#141316] text-amber-500 shadow-sm"
                              : "text-zinc-500"
                          }`}
                        >
                          <DollarSign size={12} />
                          Flat
                        </button>
                      </div>

                      <Input
                        type="number"
                        min="0"
                        placeholder={
                          formState.type === "percentage"
                            ? "e.g. 15 (%)"
                            : "e.g. 50 ($)"
                        }
                        value={formState.value}
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, value: e.target.value }))
                        }
                        className="max-w-[160px]"
                      />

                      {/* ডেডলাইন বা এক্সপায়ার ডেট ইনপুট ফিল্ড */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400 font-medium">Deadline (Optional)</span>
                        <input
                          type="datetime-local"
                          value={formState.endDate}
                          onChange={(e) =>
                            setFormState((s) => ({ ...s, endDate: e.target.value }))
                          }
                          className="px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <Button
                        size="sm"
                        isDisabled={isSubmitting}
                        onClick={() => handleCreateDiscount(product)}
                        className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold h-10"
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}