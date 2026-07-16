"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Skeleton } from "@heroui/react";
import { Flame, Eye, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopSellingProducts } from "@/lib/api/produts";

// Same tiering language as TopVendors — top 3 get a distinct medallion,
// everyone else shares a quiet neutral badge.
const RANK_TIERS = {
  1: {
    gradient: "from-amber-300 via-amber-400 to-amber-600",
    ring: "ring-amber-400/60",
    text: "text-amber-950",
  },
  2: {
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    ring: "ring-slate-300/60",
    text: "text-slate-900",
  },
  3: {
    gradient: "from-orange-300 via-orange-400 to-orange-700",
    ring: "ring-orange-400/50",
    text: "text-orange-950",
  },
};

const DEFAULT_TIER = {
  gradient: "from-zinc-700 to-zinc-800",
  ring: "ring-white/10",
  text: "text-zinc-200",
};

export default function TopSellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        // Ask the backend for products sorted by sales volume, capped
        // to a homepage-sized set. Adjust the limit to taste.
        const data = await getTopSellingProducts(8);
        if (data?.success && Array.isArray(data.data)) {
          setProducts(data.data);
          setUsedFallback(Boolean(data.usedFallback));
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopSelling();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 inline-flex items-center gap-1.5">
            <Flame size={13} className="fill-amber-400 text-amber-400" />
            {usedFallback ? "Just Landed" : "Best Sellers"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1.5">
            {usedFallback ? "New Arrivals" : "Top Selling Products"}
          </h2>
          <p className="text-sm text-default-500 mt-1.5">
            {usedFallback
              ? "No sales recorded yet — here's what's newest."
              : "Ranked by units sold across all vendors."}
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-block text-sm font-semibold text-amber-500 hover:text-amber-600 shrink-0"
        >
          View all &rarr;
        </Link>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        <AnimatePresence>
          {products.map((product, index) => {
            const rank = index + 1;
            const tier = RANK_TIERS[rank] || DEFAULT_TIER;
            const soldCount = product.soldCount ?? product.totalSold ?? 0;

            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl overflow-hidden border border-default-200 dark:border-white/10 bg-background dark:bg-zinc-900/60 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <Link
                  href={`/products/${product._id}-${(product.title || "")
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.title || "Product"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    {/* Rank medallion */}
                    <div className="absolute top-2.5 left-2.5">
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${tier.gradient} ring-2 ${tier.ring} flex items-center justify-center font-black text-[11px] ${tier.text}`}
                      >
                        {rank === 1 ? <Crown size={12} className="fill-current" /> : rank}
                      </div>
                    </div>

                    {/* Units sold badge */}
                    {soldCount > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold bg-zinc-900/80 backdrop-blur-sm text-amber-400 border border-amber-400/20 px-2 py-1 rounded-full">
                        <Flame size={10} className="fill-amber-400" />
                        {soldCount} sold
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-bold truncate">
                        {product.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-amber-400 text-sm font-extrabold">
                          ${product.price}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/90 text-xs inline-flex items-center gap-1">
                          <Eye size={12} /> View
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <Link
        href="/products"
        className="sm:hidden mt-6 block text-center text-sm font-semibold text-amber-500"
      >
        View all products &rarr;
      </Link>
    </div>
  );
}