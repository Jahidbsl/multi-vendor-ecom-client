"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Skeleton } from "@heroui/react";
import { Star, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopVendors } from "@/lib/api/vendors";

export default function TopVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImg, setFailedImg] = useState({});

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const data = await getTopVendors();
        if (data?.success && Array.isArray(data.data)) {
          setVendors(data.data);
        }
      } catch (error) {
        console.error("Error fetching top vendors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopVendors();
  }, []);

  const markFailed = (id, type) => {
    setFailedImg((prev) => ({ ...prev, [`${id}-${type}`]: true }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Top Rated Vendors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendors.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Top Rated Vendors</h2>
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {vendors.map((vendor) => {
            const avatarFailed = !vendor.avatar || failedImg[`${vendor._id}-avatar`];

            return (
              <motion.div
                key={vendor._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 border border-default-200 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl flex flex-row items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-default-100 flex-shrink-0">
                    {avatarFailed ? (
                      <div className="w-full h-full flex items-center justify-center bg-default-200">
                        <User size={24} className="text-default-400" />
                      </div>
                    ) : (
                      <Image
                        src={vendor.avatar}
                        alt={vendor.name || "Vendor"}
                        fill
                        sizes="64px"
                        className="object-cover"
                        onError={() => markFailed(vendor._id, "avatar")}
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="font-semibold text-base truncate">
                      {vendor.name || "Unnamed Vendor"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-amber-500 mt-0.5">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold text-foreground">
                        {vendor.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-xs text-default-400">
                        ({vendor.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}