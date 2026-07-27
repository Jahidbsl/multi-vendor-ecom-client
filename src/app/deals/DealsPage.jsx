"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@heroui/react";
import { getProducts } from "@/lib/api/produts";
import { getProductDiscount } from "@/lib/api/discounts";
import Image from "next/image";
import Link from "next/link";
import { Eye, ArrowLeft, ArrowRight } from "lucide-react";
import DiscountBanner from "@/components/DiscountBanner";

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        const productRes = await getProducts(1, 100);
        let allProducts = [];

        if (productRes?.success && Array.isArray(productRes.data)) {
          allProducts = productRes.data;
        } else if (Array.isArray(productRes)) {
          allProducts = productRes;
        }

        const discountedProducts = [];
        for (const product of allProducts) {
          const productId = product._id || product.id;
          
          if (product.hasDiscount === false) {
            continue; 
          }

          let hasOffer = product.hasDiscount === true || (product.originalPrice && product.originalPrice > product.price);
          let discountInfo = null;

          if (!hasOffer && productId) {
            try {
              const discountRes = await getProductDiscount(productId);
              if (discountRes?.success && discountRes?.data) {
                hasOffer = true;
                discountInfo = discountRes.data;
              }
            } catch (err) {
              console.error(`Error fetching discount for ${productId}:`, err);
            }
          }

          if (product.hasDiscount !== false && (hasOffer || discountInfo)) {
            discountedProducts.push({
              ...product,
              discountInfo,
            });
          }
        }

        setDeals(discountedProducts);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDeals = deals.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <DiscountBanner/>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#0A0A0A] dark:text-[#FAF7F2]">All Discounts & Deals</h1>
        <p className="mt-2 text-[#0A0A0A]/60 dark:text-[#D9CBB4]">Browse all active offers and discounted items.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="relative h-[300px] sm:h-[350px] p-4 animate-pulse bg-default-200" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-[#0A0A0A]/60 dark:text-[#D9CBB4]">No active discounts found at the moment.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDeals.map((product, index) => {
              const title = product.title || product.name || "Special Product";
              const originalPrice = product.originalPrice || product.price || 0;
              const currentPrice = product.price || 0;
              
              let discountPercentage = product.discountPercentage || product.discount || 0;
              if (discountPercentage === 0 && originalPrice > currentPrice && originalPrice > 0) {
                discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
              }

              const productImage = product.image || product.images?.[0] || product.thumbnail;
              const productId = product._id || product.id;

              return (
                <Card
                  key={productId || index}
                  className="relative h-[300px] sm:h-[350px] group overflow-hidden rounded-2xl border border-default-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {discountPercentage > 0 && (
                    <span className="absolute top-3 right-3 z-20 text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                      -{discountPercentage}% OFF
                    </span>
                  )}

                  {product.category && (
                    <span className="absolute top-3 left-3 z-20 capitalize text-xs font-semibold bg-zinc-900/80 backdrop-blur-md text-amber-400 border border-amber-400/20 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}

                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-default-100 text-xs text-default-400">No Image</div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                  <Card.Footer className="z-20 mt-auto flex items-end justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold text-white sm:text-lg truncate">
                        {title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-amber-400">
                          ${currentPrice.toFixed(2)}
                        </span>
                        {originalPrice > currentPrice && (
                          <span className="text-xs text-default-400 line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={productId ? `/products/${productId}` : "#"}
                    >
                      <Button
                        className="bg-white/25 hover:bg-amber-400 text-white font-semibold"
                        size="sm"
                      >
                        <Eye size={16} /> View Details
                      </Button>
                    </Link>
                  </Card.Footer>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background border border-default-200 dark:border-white/10 rounded-2xl p-4 shadow-sm mt-8">
              <span className="text-sm text-default-500">
                Showing Page{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalPages}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ArrowLeft size={16} /> Previous
                </Button>

                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}