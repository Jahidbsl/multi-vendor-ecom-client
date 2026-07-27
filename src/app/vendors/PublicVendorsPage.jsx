"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Avatar, Button, Input } from "@heroui/react";
import { toast } from "react-toastify";
import { getVendors } from "@/lib/api/vendors";
import {
  Store,
  Phone,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

// Resolves an image field into a fully-qualified URL.
// Handles absolute URLs, relative API paths, and missing values.
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") 
    

  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
};

export default function PublicVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState({
    totalVendors: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
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
      year: "numeric",
    });
  };

  const fetchVendorsList = useCallback(
    async (page) => {
      try {
        setIsLoading(true);
        const data = await getVendors(page, pagination.limit);

        if (data.success) {
          // Only show ACTIVE vendors to public users
          const activeOnly = data.data.filter(
            (item) => item.status !== "blocked",
          );
          setVendors(activeOnly);
          setFilteredVendors(activeOnly);
          setPagination(data.pagination);
        } else {
          toast.error(data.message || "Failed to load vendors.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error connecting to server.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchVendorsList(pagination.currentPage);
  }, [fetchVendorsList, pagination.currentPage]);

  // Handle Search Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredVendors(
        vendors.filter(
          (v) =>
            v.shopName?.toLowerCase().includes(q) ||
            v.name?.toLowerCase().includes(q) ||
            v.userName?.toLowerCase().includes(q),
        ),
      );
    }
  }, [searchQuery, vendors]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0b0d] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Store className="text-amber-500" size={32} />
              Explore Vendor Stores
            </h1>
            {/* <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Discover verified stores and trusted sellers on our platform
            </p> */}
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10"
              size={18}
            />
            <Input
              placeholder="Search store or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141316] animate-pulse p-5"
              />
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141316] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Store className="mx-auto text-zinc-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              No Vendors Found
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Try searching with another store name or seller name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((item) => {
              const vendorId = getItemId(item);
              const imgSrc = getImageUrl(
                item.shopImage || item.image || item.userAvatar,
              );

              return (
                <div
                  key={vendorId}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all duration-200"
                >
                  <div>
                    {/* Top Shop Banner / Logo & Verified Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden bg-amber-400 flex items-center justify-center">
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={item.shopName || item.name || "Store"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {(item.shopName || item.name || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h3 className="font-bold text-zinc-900 dark:text-white truncate text-base group-hover:text-amber-500 transition-colors">
                            {item.shopName || "Unnamed Store"}
                          </h3>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            Owner: {item.name || item.userName || "N/A"}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 shrink-0">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    </div>

                    {/* Details Info */}
                    <div className="space-y-2 py-3 border-t border-b border-zinc-100 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-zinc-400" />
                        <span>{item.phone || "Contact hidden"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        <span>Joined: {formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visit Store Button */}
                  <div className="mt-5">
                    <Link
                      href={`/vendors/${vendorId}`}
                      className="block w-full"
                    >
                      <Button className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                        Visit Store
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
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
        )}
      </div>
    </div>
  );
}