"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Avatar, Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import {
  Store,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  Package,
} from "lucide-react";

export default function VendorDetailsPage({ params }) {
  const { id } = use(params);

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVendorDetails() {
      try {
        setIsLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
          "http://localhost:5000";

        // 1. Fetch vendor store details
        const vendorRes = await fetch(`${baseUrl}/api/vendors/${id}`);
        const vendorData = await vendorRes.json();

        if (vendorData?.success) {
          setVendor(vendorData.data);
        } else {
          toast.error(vendorData?.message || "Vendor store not found");
        }

        // 2. Fetch vendor products
        const productsRes = await fetch(`${baseUrl}/api/products/vendor/${id}`);
        const productsData = await productsRes.json();

        if (productsData?.success) {
          setProducts(productsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching vendor details:", error);
        toast.error("Failed to load store details");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const rawDate =
      typeof dateValue === "object" && dateValue.$date
        ? dateValue.$date
        : dateValue;

    return new Date(rawDate).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d]">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" color="warning" />
          <p className="text-sm text-zinc-500">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d] p-4 text-center">
        <Store size={56} className="text-zinc-400 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
          Store Not Found
        </h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-md">
          The store you are looking for does not exist or may have been suspended.
        </p>
        <Link href="/vendors" className="mt-6">
          <Button className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold rounded-xl">
            <ArrowLeft size={16} />
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0b0d] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back Button */}
        <div>
          <Link href="/vendors">
            <Button
              size="sm"
              variant="flat"
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              All Stores
            </Button>
          </Link>
        </div>

        {/* Store Hero Banner & Profile Card */}
        <div className="relative rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] overflow-hidden shadow-sm">
          <div className="h-36 sm:h-48 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 relative" />

          <div className="p-6 sm:p-8 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <Avatar
                src={vendor.shopImage || vendor.image || vendor.userAvatar}
                name={vendor.shopName || vendor.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-[#141316] shadow-md shrink-0 bg-white"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {vendor.shopName || "Unnamed Store"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck size={14} />
                    Verified Seller
                  </span>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Owner:{" "}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {vendor.name || vendor.userName || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-white/5 w-full md:w-auto">
              {vendor.phone && (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Phone size={14} className="text-amber-500" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              {vendor.userEmail && (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Mail size={14} className="text-amber-500" />
                  <span>{vendor.userEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1">
                <Calendar size={14} className="text-amber-500" />
                <span>Member since {formatDate(vendor.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="text-amber-500" size={24} />
              Store Products ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#141316] rounded-2xl border border-zinc-200 dark:border-white/10">
              <Package className="mx-auto text-zinc-400 mb-3" size={48} />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                No Products Available
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                This store hasn't added any products yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all duration-200"
                >
                  <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    <img
                      src={
                        product.image ||
                        product.images?.[0] ||
                        "https://via.placeholder.com/300"
                      }
                      alt={product.title || product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {product.title || product.name}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {product.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5">
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">
                        ${product.price}
                      </span>
                      <Link href={`/products/${product._id}-${product.title.replace(/\s+/g, "-").toLowerCase()}`}>
                      
                        <Button
                          size="sm"
                          className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold rounded-lg"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}