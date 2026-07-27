"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBanners } from "@/lib/api/banners";

export default function DiscountBanner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await getBanners();
        const activeBanners = Array.isArray(res) ? res.filter(b => b.isActive !== false) : [res];
        setBanners(activeBanners.filter(Boolean));
      } catch (error) {
        console.error("Error loading banners:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const currentBanner = banners[currentIndex];

  // প্রোডাক্ট ডিটেইলস পেজের মতো ইমেজ কম্বাইন ও ইউনিক করার লজিক
  const rawImages = [
    currentBanner?.image,
    ...(currentBanner?.images || []),
  ].filter(Boolean);

  const allImages = Array.from(new Set(rawImages));
  if (allImages.length === 0) allImages.push("https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=1200&auto=format&fit=crop");

  const currentBgImage = allImages[imageIndex] || allImages[0];

  // একই ব্যানার/প্রোডাক্টে একাধিক ছবি থাকলে অটো স্লাইড
  useEffect(() => {
    if (allImages.length <= 1) return;
    const imgInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(imgInterval);
  }, [allImages.length, currentIndex]);

  // কাউন্টডাউন টাইমার লজিক
  useEffect(() => {
    if (!currentBanner?.endDate) return;

    const targetDate = new Date(currentBanner.endDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentBanner]);

  // একাধিক ব্যানার থাকলে অটো স্লাইড
  useEffect(() => {
    if (banners.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setImageIndex(0);
    }, 7000);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  if (loading || !currentBanner) return null;

  const handleNextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setImageIndex(0);
  };

  const handlePrevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setImageIndex(0);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 my-6">
      <div 
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gray-950 text-white min-h-[400px] sm:min-h-[450px] flex flex-col justify-between p-6 sm:p-10 border border-default-200 dark:border-white/10 group transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(3, 7, 18, 0.95)), url(${currentBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${imageIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 h-full my-auto z-10"
          >
            {/* বাম পাশ: ডিসকাউন্ট ট্যাগ ও টাইটেল */}
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">
                <Flame className="w-4 h-4" /> 
                {currentBanner.discountValue}{currentBanner.discountType === 'percentage' ? '% OFF' : '$ OFF'} LIMITED OFFER
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                {currentBanner.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-200">
                Don't miss out on this exclusive deal. Grab your favourite product before the timer runs out!
              </p>
            </div>

            {/* ডান পাশ: কাউন্টডাউন ও শপ নাও বাটন */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-6 w-full md:w-auto">
              {currentBanner.endDate && (
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 shadow-inner">
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div className="flex items-center gap-2 text-center font-mono text-sm">
                    <div>
                      <span className="block font-bold text-xl">{String(timeLeft.days).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 uppercase">Days</span>
                    </div>
                    <span className="text-gray-500 font-bold">:</span>
                    <div>
                      <span className="block font-bold text-xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 uppercase">Hours</span>
                    </div>
                    <span className="text-gray-500 font-bold">:</span>
                    <div>
                      <span className="block font-bold text-xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 uppercase">Mins</span>
                    </div>
                    <span className="text-gray-500 font-bold">:</span>
                    <div>
                      <span className="block font-bold text-xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-400 uppercase">Secs</span>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href={currentBanner.productId ? `/products/${currentBanner.productId}` : "/shop"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all transform hover:scale-105"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* যদি একাধিক ব্যানার বা একাধিক ছবি থাকে, তবেই কেবল কন্ট্রোলস/স্লাইডার শো করবে */}
        {(banners.length > 1 || allImages.length > 1) && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10 z-10">
            {/* ব্যানার ইন্ডিকেটর ডটস */}
            <div className="flex items-center gap-1.5">
              {banners.length > 1 && banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setImageIndex(0);
                  }}
                  className={`h-2 rounded-full transition-all ${currentIndex === idx ? "w-8 bg-amber-400" : "w-2 bg-white/40"}`}
                />
              ))}
            </div>

            {/* প্রোডাক্টের একাধিক ছবি থাকলে তার ইন্ডিকেটর */}
            <div className="hidden sm:flex items-center gap-1">
              {allImages.length > 1 && allImages.map((_, imgIdx) => (
                <span 
                  key={imgIdx} 
                  className={`h-1.5 rounded-full transition-all ${imageIndex === imgIdx ? "w-4 bg-amber-400" : "w-1.5 bg-white/30"}`} 
                />
              ))}
            </div>

            {/* নেভিগেশন অ্যারো বাটন (একাধিক ব্যানার থাকলে) */}
            {banners.length > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevBanner} 
                  className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 transition shadow-md"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={handleNextBanner} 
                  className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 transition shadow-md"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}