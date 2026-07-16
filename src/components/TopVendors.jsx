"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Skeleton } from "@heroui/react";
import { Star, User, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopVendors } from "@/lib/api/vendors";
import Link from "next/link";

// Rank tiers: only the top 3 get a distinct medallion treatment —
// everyone else shares a quiet neutral badge. This keeps the "boldness"
// spent in one place instead of decorating every row equally.
const RANK_TIERS = {
  1: {
    gradient: "from-amber-300 via-amber-400 to-amber-600",
    ring: "ring-amber-400/60",
    glow: "shadow-[0_0_24px_-4px_rgba(245,158,11,0.55)]",
    text: "text-amber-950",
  },
  2: {
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    ring: "ring-slate-300/60",
    glow: "shadow-[0_0_18px_-6px_rgba(148,163,184,0.5)]",
    text: "text-slate-900",
  },
  3: {
    gradient: "from-orange-300 via-orange-400 to-orange-700",
    ring: "ring-orange-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(234,88,12,0.45)]",
    text: "text-orange-950",
  },
};

const DEFAULT_TIER = {
  gradient: "from-default-200 to-default-300 dark:from-zinc-700 dark:to-zinc-800",
  ring: "ring-default-200 dark:ring-white/10",
  glow: "",
  text: "text-default-700 dark:text-zinc-200",
};

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
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[76px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendors.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div className="mb-8 sm:mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
          Vendor Leaderboard
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1.5">
          Top Rated Vendors
        </h2>
        <p className="text-sm text-default-500 mt-1.5">
          Ranked by average customer rating, highest first.
        </p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        <AnimatePresence>
          {vendors.map((vendor, index) => {
            const rank = index + 1;
            const tier = RANK_TIERS[rank] || DEFAULT_TIER;
            const avatarFailed = !vendor.avatar || failedImg[`${vendor._id}-avatar`];
            const rating = vendor.averageRating?.toFixed(1) || "0.0";

            return (
              <motion.div
                key={vendor._id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="group relative flex items-center gap-3 rounded-2xl border border-default-200 dark:border-white/10 bg-background dark:bg-zinc-900/70 p-3 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all duration-300"
              >
                {/* Rounded-square avatar box, with a tiny rank badge on its corner */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-default-100 dark:bg-zinc-800 border border-default-200 dark:border-white/10 flex items-center justify-center">
                    {avatarFailed ? (
                      <User size={18} className="text-default-400" />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={vendor.avatar}
                          alt={vendor.name || "Vendor"}
                          fill
                          sizes="44px"
                          className="object-cover"
                          onError={() => markFailed(vendor._id, "avatar")}
                        />
                      </div>
                    )}
                  </div>
                  {rank <= 3 && (
                    <div
                      className={`absolute -top-1.5 -left-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-gradient-to-br ${tier.gradient} ring-2 ring-background dark:ring-zinc-900 flex items-center justify-center text-[9px] font-black ${tier.text}`}
                    >
                      {rank === 1 ? <Crown size={9} className="fill-current" /> : rank}
                    </div>
                  )}
                </div>

                {/* Title + subtitle, mirroring "Name / rating · reviews" */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {vendor.name || "Unnamed Vendor"}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-default-400">
                    <Star size={11} className="text-amber-500 fill-amber-400 shrink-0" />
                    <span className="font-semibold text-default-500">{rating}</span>
                    <span>· {vendor.totalReviews || 0} reviews</span>
                  </div>
                </div>

                {/* Outline pill action, matching the "Download" button style */}
                <Link href={`/vendors/${vendor._id}`} className="shrink-0">
                  <Button
                    variant="bordered"
                    size="sm"
                    className="font-medium rounded-full border-default-200 dark:border-white/15 group-hover:border-amber-400 group-hover:text-amber-500 transition-colors px-3"
                  >
                    View
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}