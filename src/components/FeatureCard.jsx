// components/FeatureCard.jsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, Button, Skeleton } from "@heroui/react";
import { Eye, ShoppingCart, Heart, Store, Star } from "lucide-react";
import { getProducts } from "@/lib/api/produts";

export default function FeatureCard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const result = await getProducts(1, 10);
        if (result?.success && Array.isArray(result.data)) {
          const filtered = result.data.filter((product) => product.hasfeature === true);
          setFeaturedProducts(filtered);
        }
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Featured Products</h2>
          <p className="text-sm text-default-500">Handpicked featured items just for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="relative h-[350px] p-4">
              <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Featured Products</h2>
        <p className="text-sm text-default-500">Handpicked featured items just for you</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((product) => {
          const discountPercentage =
            product.hasDiscount && product.originalPrice && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;

          const productUrl = `/products/${product._id}-${(product.title || "product")
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

          return (
            <Card
              key={product._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-500/40 dark:border-amber-400/30 bg-background shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                <span className="pointer-events-auto capitalize text-[11px] font-semibold bg-zinc-900/80 backdrop-blur-md text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full shadow-md">
                  {product.category || "General"}
                </span>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                    <Star size={12} className="fill-current" /> Featured
                  </span>
                  {discountPercentage && (
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-full shadow-lg">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>
              </div>

              <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-default-100 dark:bg-zinc-900">
                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.title || "Featured Product Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                <div>
                  {product.shopName && (
                    <div className="flex items-center gap-1 text-xs text-default-500 mb-1 truncate">
                      <Store size={12} className="text-amber-500 shrink-0" />
                      <span className="truncate">{product.shopName}</span>
                    </div>
                  )}

                  <Link href={productUrl} className="block">
                    <h3 className="text-base font-bold text-foreground line-clamp-1 hover:text-amber-500 transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-default-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-amber-500">
                        ${product.price}
                      </span>
                      {product.hasDiscount && product.originalPrice && (
                        <span className="text-xs text-default-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link href={productUrl}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-default-100 hover:bg-default-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}