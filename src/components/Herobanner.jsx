"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import { LuStore, LuPackage, LuGlobe, LuArrowRight } from "react-icons/lu";
import shoppingAnimation from "@/public/lottie/Shopping bag.json";
import { getAdminCategories } from "@/lib/api/categories";

const FLOATING_TAGS = [
  { label: "Ceramic vase", price: "$42", top: "6%", left: "-6%", delay: "0s", rotate: "-6deg" },
  { label: "Leather tote", price: "$118", top: "68%", left: "-4%", delay: "1.1s", rotate: "4deg" },
  { label: "Table lamp", price: "$76", top: "2%", left: "78%", delay: "0.6s", rotate: "5deg" },
  { label: "Wool throw", price: "$58", top: "72%", left: "80%", delay: "1.6s", rotate: "-4deg" },
];

const STATS = [
  { label: "Independent vendors", value: 1240, suffix: "+", Icon: LuStore },
  { label: "Products listed", value: 86000, suffix: "+", Icon: LuPackage },
  { label: "Countries shipped to", value: 42, suffix: "", Icon: LuGlobe },
];

function useCountUp(target, shouldRun) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    if (!shouldRun) {
      setValue(target);
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, shouldRun]);

  return value;
}

export function HeroBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [categoryTicker, setCategoryTicker] = useState([
    "Fashion",
    "Home & Living",
    "Electronics",
    "Beauty",
    "Handmade",
    "Groceries",
    "Vintage",
    "Art & Prints",
  ]);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchCategories() {
      const res = await getAdminCategories();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategoryTicker(res.data.map((cat) => cat.name));
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FAF7F2] dark:bg-[#0A0A0A]"
    >
      <div className="glow-a pointer-events-none absolute -top-24 -left-16 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-[#B98A3D]/25 blur-[80px] sm:blur-[100px]" />
      <div className="glow-b pointer-events-none absolute -bottom-32 -right-10 h-72 w-72 sm:h-[28rem] sm:w-[28rem] rounded-full bg-[#9C4A32]/15 blur-[90px] sm:blur-[110px]" />

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12">
          <div className="text-center lg:text-left">
            <span
              className={`reveal inline-flex items-center gap-1.5 rounded-full border border-[#B98A3D]/30 bg-[#B98A3D]/10 px-3 py-1 text-xs font-medium text-[#B98A3D] ${isVisible ? "reveal-in" : ""}`}
              style={{ animationDelay: "0.05s" }}
            >
              <LuStore className="size-3.5" />
              1,240+ independent shops, one checkout
            </span>

            <h1
              className={`reveal mt-5 sm:mt-6 font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-[#0A0A0A] dark:text-[#FAF7F2] ${isVisible ? "reveal-in" : ""}`}
              style={{ animationDelay: "0.15s" }}
            >
              Every vendor's best,
              <br className="hidden sm:block" /> under one roof.
            </h1>

            <p
              className={`reveal mt-4 sm:mt-5 text-sm sm:text-lg text-[#0A0A0A]/60 dark:text-[#D9CBB4]/80 max-w-xl mx-auto lg:mx-0 ${isVisible ? "reveal-in" : ""}`}
              style={{ animationDelay: "0.25s" }}
            >
              Shop handmade goods, small-batch fashion, and local finds from
              thousands of independent sellers — with one cart and one
              delivery tracker for all of them.
            </p>

            <div
              className={`reveal mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 ${isVisible ? "reveal-in" : ""}`}
              style={{ animationDelay: "0.35s" }}
            >
              <Link
                href="/products"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#B98A3D] px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-all hover:brightness-95 hover:-translate-y-0.5"
              >
                Start shopping
                <LuArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/vendor/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#0A0A0A]/15 dark:border-white/20 px-6 py-3 text-sm font-semibold text-[#0A0A0A] dark:text-[#FAF7F2] transition-all hover:border-[#B98A3D] hover:text-[#B98A3D] hover:-translate-y-0.5"
              >
                Become a vendor
              </Link>
            </div>
          </div>

          <div
            className={`reveal relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none ${isVisible ? "reveal-in" : ""}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative">
              <Lottie
                animationData={shoppingAnimation}
                loop
                className="w-full h-auto"
                aria-hidden="true"
              />

              <div className="hidden md:block">
                {FLOATING_TAGS.map((tag) => (
                  <div
                    key={tag.label}
                    className="drift absolute z-10 rounded-lg border border-[#0A0A0A]/10 dark:border-white/10 bg-white/90 dark:bg-[#141414]/90 backdrop-blur px-3 py-2 shadow-lg shadow-black/5"
                    style={{
                      top: tag.top,
                      left: tag.left,
                      animationDelay: tag.delay,
                      transform: `rotate(${tag.rotate})`,
                    }}
                  >
                    <p className="text-[11px] font-medium text-[#0A0A0A]/70 dark:text-[#D9CBB4] whitespace-nowrap">
                      {tag.label}
                    </p>
                    <p className="font-mono text-sm font-semibold text-[#B98A3D]">
                      {tag.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`reveal mt-12 sm:mt-16 lg:mt-20 ${isVisible ? "reveal-in" : ""}`}
          style={{ animationDelay: "0.45s" }}
        >
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee flex w-max items-center gap-3 py-1">
              {[...categoryTicker, ...categoryTicker].map((cat, i) => (
                <span
                  key={`${cat}-${i}`}
                  className="shrink-0 rounded-full border border-[#0A0A0A]/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-1.5 text-xs font-medium text-[#0A0A0A]/70 dark:text-[#D9CBB4]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`reveal mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 border-t border-[#0A0A0A]/10 dark:border-white/10 pt-8 sm:pt-10 ${isVisible ? "reveal-in" : ""}`}
          style={{ animationDelay: "0.55s" }}
        >
          {STATS.map(({ label, value, suffix, Icon }) => {
            const count = useCountUp(value, isVisible);
            return (
              <div key={label} className="flex items-center justify-center gap-3">
                <Icon className="size-5 text-[#B98A3D] shrink-0" />
                <div className="text-left">
                  <p className="font-mono text-lg sm:text-xl font-semibold text-[#0A0A0A] dark:text-[#FAF7F2]">
                    {count.toLocaleString()}
                    {suffix}
                  </p>
                  <p className="text-xs text-[#0A0A0A]/50 dark:text-[#D9CBB4]/60">
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(14px);
        }
        .reveal-in {
          animation: reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reveal-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .drift {
          animation: drift 6s ease-in-out infinite;
        }
        @keyframes drift {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }

        .glow-a {
          animation: glow-shift 12s ease-in-out infinite;
        }
        .glow-b {
          animation: glow-shift 14s ease-in-out infinite reverse;
        }
        @keyframes glow-shift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 15px) scale(1.08);
          }
        }

        .marquee {
          animation: marquee 22s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .drift,
          .glow-a,
          .glow-b,
          .marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}