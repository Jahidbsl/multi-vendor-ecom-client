"use client";

import React, { useEffect, useState, useTransition } from "react";
import { LayoutTemplate, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Alert } from "@heroui/react";
import { getBanners, createBanner } from "@/lib/api/banners";
import { getProducts } from "@/lib/api/produts";
import { getAdminDiscounts } from "@/lib/api/discounts";
import DiscountBanner from "./DiscountBanner";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [productId, setProductId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customImage, setCustomImage] = useState("");

  const [alertInfo, setAlertInfo] = useState({ visible: false, message: "", color: "success" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannerRes, prodRes, discRes] = await Promise.all([
        getBanners().catch(() => []),
        getProducts(1, 100).catch(() => []),
        getAdminDiscounts().catch(() => []),
      ]);

      setBanners(Array.isArray(bannerRes) ? bannerRes : []);
      
      const productsData = Array.isArray(prodRes) ? prodRes : (prodRes?.products || prodRes?.data || []);
      setProducts(productsData);

      const discountsData = Array.isArray(discRes) ? discRes : (discRes?.discounts || discRes?.data || []);
      setDiscounts(discountsData);

    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProductDiscount = () => {
    if (!productId) return null;
    return discounts.find((disc) => {
      const discProdId = typeof disc.productId === "object" ? disc.productId?.$oid || disc.productId?._id : disc.productId;
      return String(discProdId) === String(productId);
    });
  };

  const getSelectedProduct = () => {
    return products.find((p) => {
      const pId = typeof p._id === "object" ? p._id?.$oid || p._id?._toString?.() || p._id?._id?.toString() : p._id;
      return String(pId) === String(productId);
    });
  };

  const discountedProductIds = new Set(
    discounts.map((disc) => {
      const id = typeof disc.productId === "object" ? disc.productId?.$oid || disc.productId?._id : disc.productId;
      return String(id);
    })
  );

  const eligibleProducts = products.filter((prod) => {
    const pId = typeof prod._id === "object" ? prod._id?.$oid || prod._id?._toString?.() || prod._id?._id?.toString() : prod._id;
    return discountedProductIds.has(String(pId));
  });

  const handleCreateBanner = (e) => {
    e.preventDefault();
    if (!productId) {
      setAlertInfo({ visible: true, message: "Please select a product.", color: "danger" });
      return;
    }

    const matchedDiscount = getSelectedProductDiscount();
    if (!matchedDiscount) {
      setAlertInfo({ 
        visible: true, 
        message: "No active discount found for this product. Please create a discount for this product first.", 
        color: "danger" 
      });
      return;
    }

    const selectedProd = getSelectedProduct();

    startTransition(async () => {
      const payload = {
        title: customTitle || selectedProd?.title || "Special Promotional Offer",
        discountValue: matchedDiscount.discountValue,
        discountType: matchedDiscount.discountType || "percentage",
        productId,
        endDate: matchedDiscount.endDate || null,
        images: customImage ? [customImage] : (selectedProd?.images || [selectedProd?.image]),
      };

      const res = await createBanner(payload);
      if (res && res.success) {
        setAlertInfo({ visible: true, message: res.message, color: "success" });
        setProductId("");
        setCustomTitle("");
        setCustomImage("");
        loadData();
      } else {
        setAlertInfo({ visible: true, message: res?.message || "Failed to create banner", color: "danger" });
      }

      setTimeout(() => setAlertInfo((prev) => ({ ...prev, visible: false })), 4000);
    });
  };

  if (!isMounted) return <p className="p-6">Loading...</p>;

  const selectedProd = getSelectedProduct();
  const matchedDiscount = getSelectedProductDiscount();
  const previewImages = customImage ? [customImage] : (selectedProd?.images || (selectedProd?.image ? [selectedProd.image] : ["https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=1200&auto=format&fit=crop"]));

  const activeBanner = banners.find((b) => b.isActive === true) || banners[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {alertInfo.visible && (
        <div className="mb-4">
          <Alert color={alertInfo.color} title={alertInfo.message} />
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Store Promotional Banner Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-500" /> Create New Active Banner
          </h3>

          <form onSubmit={handleCreateBanner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Product (Only Discounted)</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Choose Discounted Product --</option>
                {eligibleProducts.map((prod) => {
                  const pId = typeof prod._id === "object" ? prod._id?.$oid || prod._id?._toString?.() || prod._id?._id?.toString() : prod._id;
                  return (
                    <option key={pId} value={pId}>
                      {prod.title}
                    </option>
                  );
                })}
              </select>
              {eligibleProducts.length === 0 && !loading && (
                <p className="text-xs text-red-500 mt-1">No products with active discounts found. Please create a discount first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Banner Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Flash Summer Sale"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {productId && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-1 text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Auto-fetched from Discount:</p>
                {matchedDiscount ? (
                  <>
                    <p>Type: <span className="font-bold uppercase">{matchedDiscount.discountType}</span></p>
                    <p>Value: <span className="font-bold">{matchedDiscount.discountValue}{matchedDiscount.discountType === 'percentage' ? '%' : '$'}</span></p>
                    <p>Deadline: <span className="font-bold">{matchedDiscount.endDate ? new Date(matchedDiscount.endDate).toLocaleString() : "No deadline"}</span></p>
                  </>
                ) : (
                  <p className="text-red-500 font-medium">⚠️ No discount found for this product!</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Custom Banner Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://image-url.com"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                className="w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !matchedDiscount}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> {isPending ? "Publishing..." : "Set as Active Banner"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {productId && matchedDiscount && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Banner Preview</h4>
              <DiscountBanner
                title={customTitle || selectedProd?.title || "Special Offer"}
                discountValue={matchedDiscount.discountValue}
                discountType={matchedDiscount.discountType}
                endDate={matchedDiscount.endDate}
                images={previewImages}
                productId={productId}
              />
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-md font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Currently Active Store Banner</h4>
            {loading ? (
              <p className="text-sm text-gray-500">Loading active banner...</p>
            ) : !activeBanner ? (
              <p className="text-sm text-gray-500">No active banner found.</p>
            ) : (
              <DiscountBanner
                title={activeBanner.title}
                discountValue={activeBanner.discountValue}
                discountType={activeBanner.discountType}
                endDate={activeBanner.endDate}
                images={activeBanner.images}
                productId={activeBanner.productId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}