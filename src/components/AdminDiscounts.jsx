"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Tag, Calendar } from "lucide-react";
import { Alert, AlertDialog, Button } from "@heroui/react";
import {
  getAdminDiscounts,
  createProductDiscount,
  createCategoryDiscount,
  deleteDiscount,
} from "@/lib/api/discounts";
import { getProducts } from "@/lib/api/produts";
import { getAdminCategories } from "@/lib/api/categories";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [discountTarget, setDiscountTarget] = useState("product");
  const [productId, setProductId] = useState("");
  const [category, setCategory] = useState("");
  const [vendorId, setVendorId] = useState("admin");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [discountToDelete, setDiscountToDelete] = useState(null);

  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    message: "",
    color: "success",
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [discRes, prodRes, catRes] = await Promise.all([
        getAdminDiscounts().catch(() => null),
        getProducts(1, 100).catch(() => null),
        getAdminCategories().catch(() => null),
      ]);

      if (Array.isArray(discRes)) {
        setDiscounts(discRes);
      } else if (discRes && typeof discRes === "object") {
        setDiscounts(discRes.data || discRes.discounts || []);
      } else {
        setDiscounts([]);
      }

      if (Array.isArray(prodRes)) {
        setProducts(prodRes);
      } else if (prodRes && typeof prodRes === "object") {
        setProducts(prodRes.data || prodRes.products || []);
      } else {
        setProducts([]);
      }

      if (Array.isArray(catRes)) {
        setCategories(catRes);
      } else if (catRes && typeof catRes === "object") {
        const catData = catRes.data || catRes.categories || [];
        setCategories(Array.isArray(catData) ? catData : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load discount data:", error);
      setDiscounts([]);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = (e) => {
    e.preventDefault();
    if (!discountValue) return;

    startTransition(async () => {
      let res;
      const payload = {
        vendorId,
        discountType,
        discountValue: Number(discountValue),
        ...(expiresAt && { endDate: expiresAt }),
      };

      try {
        if (discountTarget === "product") {
          if (!productId) {
            alert("Please select a product");
            return;
          }
          res = await createProductDiscount({
            ...payload,
            productId,
          });
        } else {
          if (!category) {
            alert("Please select a category");
            return;
          }
          res = await createCategoryDiscount({
            ...payload,
            category,
          });
        }

        if (res && (res.success || res.status === 201 || res.status === 200)) {
          setAlertInfo({
            visible: true,
            message: res.message || "Discount created successfully!",
            color: "success",
          });
          setDiscountValue("");
          setProductId("");
          setCategory("");
          setExpiresAt("");
          loadData();
        } else {
          setAlertInfo({
            visible: true,
            message: res?.message || "Failed to create discount.",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error creating discount:", error);
        setAlertInfo({
          visible: true,
          message: "An unexpected error occurred.",
          color: "danger",
        });
      }

      setTimeout(
        () => setAlertInfo((prev) => ({ ...prev, visible: false })),
        4000,
      );
    });
  };

  const confirmDelete = (id) => {
    startTransition(async () => {
      const res = await deleteDiscount(id);
      if (res && (res.success || res.status === 200)) {
        setAlertInfo({
          visible: true,
          message: "Discount removed successfully! Original price restored.",
          color: "success",
        });
        loadData();
      } else {
        setAlertInfo({
          visible: true,
          message: res?.message || "Failed to remove discount.",
          color: "danger",
        });
      }
      setDiscountToDelete(null);
      setTimeout(
        () => setAlertInfo((prev) => ({ ...prev, visible: false })),
        4000,
      );
    });
  };

  if (!isMounted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <p className="text-gray-500">Loading management panel...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      {alertInfo.visible && (
        <div className="mb-4">
          <Alert color={alertInfo.color} title={alertInfo.message} />
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Admin Discount Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discount Creation Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" /> Create New Discount
          </h3>

          <form onSubmit={handleCreateDiscount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apply On
              </label>
              <select
                value={discountTarget}
                onChange={(e) => {
                  setDiscountTarget(e.target.value);
                  setProductId("");
                  setCategory("");
                }}
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="product">Single Product</option>
                <option value="category">Entire Category</option>
              </select>
            </div>

            {discountTarget === "product" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Product
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((prod) => {
                    const prodId = typeof prod._id === "object" ? prod._id?.$oid : prod._id;
                    return (
                      <option key={prodId} value={prodId}>
                        {prod.title}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat, index) => {
                    const catName = typeof cat === "string" ? cat : (cat.name || cat.title);
                    const catKey = cat._id || catName || index;
                    return (
                      <option key={catKey} value={catName}>
                        {catName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value {discountType === "percentage" ? "(0-100)" : "($)"}
              </label>
              <input
                type="number"
                placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 50"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                min="0"
                max={discountType === "percentage" ? "100" : undefined}
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> Deadline Time
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" /> {isPending ? "Creating..." : "Create Discount"}
            </button>
          </form>
        </div>

        {/* Discounts Table List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 h-fit">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-800">
                    <th className="py-3 px-4">Product / Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Loading discounts...
                      </td>
                    </tr>
                  ) : discounts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No active discounts found.
                      </td>
                    </tr>
                  ) : (
                    discounts.map((disc) => {
                      const discId = typeof disc._id === "object" ? disc._id?.$oid : disc._id;
                      const targetProductId = typeof disc.productId === "object" ? disc.productId?.$oid || disc.productId?._id : disc.productId;
                      
                      const matchedProduct = products.find((p) => {
                        const pId = typeof p._id === "object" ? p._id?.$oid : p._id;
                        return pId === targetProductId;
                      });

                      const rawEndDate = disc.endDate;
                      const formattedEndDate = typeof rawEndDate === "object" ? rawEndDate?.$date : rawEndDate;

                      return (
                        <tr key={discId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                            {disc.category ? (
                              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                [Category: {disc.category}]
                              </span>
                            ) : (
                              <span>
                                {matchedProduct?.title || disc.title || `Product ID: ${targetProductId?.toString().slice(-6)}`}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 uppercase text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {disc.discountType}
                          </td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-bold">
                            {disc.discountValue}
                            {disc.discountType === "percentage" ? "%" : "$"}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                            {formattedEndDate ? new Date(formattedEndDate).toLocaleString() : "No deadline"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              isIconOnly
                              variant="danger"
                              size="sm"
                              onClick={() => setDiscountToDelete(disc)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition shadow-sm inline-flex items-center justify-center cursor-pointer"
                              title="Remove Discount"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={Boolean(discountToDelete)}
        onOpenChange={(open) => !open && setDiscountToDelete(null)}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Remove discount permanently?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will remove the discount for{" "}
                  <strong>
                    {discountToDelete?.category
                      ? `Category: ${discountToDelete.category}`
                      : `Product`}
                  </strong>{" "}
                  and restore its original price. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  slot="close"
                  variant="tertiary"
                  onClick={() => setDiscountToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  slot="close"
                  variant="danger"
                  disabled={isPending}
                  onClick={() => {
                    if (discountToDelete) {
                      const dId = typeof discountToDelete._id === "object" ? discountToDelete._id?.$oid : discountToDelete._id;
                      confirmDelete(dId);
                    }
                  }}
                >
                  {isPending ? "Removing..." : "Remove Discount"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}