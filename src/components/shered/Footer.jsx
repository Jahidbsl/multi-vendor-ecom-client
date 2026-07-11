"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoAppStore } from "@gravity-ui/icons";
import {
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaFacebookF,
  FaPinterestP,
} from "react-icons/fa6";
import { LuStore, LuShieldCheck, LuTruck, LuRotateCcw } from "react-icons/lu";

const SHOP_LINKS = [
  { label: "Fashion", href: "/products?category=fashion" },
  { label: "Home & Living", href: "/products?category=home" },
  { label: "Electronics", href: "/products?category=electronics" },
  { label: "Beauty", href: "/products?category=beauty" },
  { label: "Handmade", href: "/products?category=handmade" },
  { label: "Deals", href: "/deals" },
];

const VENDOR_LINKS = [
  { label: "Become a vendor", href: "/vendor/apply" },
  { label: "Vendor dashboard", href: "/vendor/dashboard" },
  { label: "Seller fees", href: "/sell/fees" },
  { label: "Vendor success stories", href: "/sell/stories" },
];

const SUPPORT_LINKS = [
  { label: "Help center", href: "/help" },
  { label: "Track an order", href: "/orders/track" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Shipping info", href: "/shipping" },
  { label: "Contact us", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Sustainability", href: "/sustainability" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
  { label: "TikTok", href: "https://tiktok.com", Icon: FaTiktok },
  { label: "X", href: "https://x.com", Icon: FaXTwitter },
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Pinterest", href: "https://pinterest.com", Icon: FaPinterestP },
];

const ASSURANCES = [
  { label: "Buyer protection on every order", Icon: LuShieldCheck },
  { label: "Tracked shipping from every vendor", Icon: LuTruck },
  { label: "Easy 30-day returns", Icon: LuRotateCcw },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse";
  const year = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // Wire this up to your newsletter provider.
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#FAF7F2] dark:bg-[#0A0A0A] text-[#0A0A0A]/70 dark:text-[#D9CBB4]">
      {/* Assurance strip */}
      <div className="border-b border-[#0A0A0A]/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ASSURANCES.map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="size-5 text-[#B98A3D] shrink-0" />
              <span className="text-sm text-[#0A0A0A] dark:text-[#FAF7F2]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-[#0A0A0A]/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-serif text-2xl text-[#0A0A0A] dark:text-[#FAF7F2]">
              Get first pick of new vendor drops
            </p>
            <p className="text-sm text-[#0A0A0A]/60 dark:text-[#D9CBB4]/70 mt-1">
              One email a week. No spam, unsubscribe anytime.
            </p>
          </div>

          {submitted ? (
            <p className="text-sm font-medium text-[#B98A3D]">
              You&apos;re on the list — check your inbox to confirm.
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:w-auto items-stretch rounded-lg border border-[#0A0A0A]/15 dark:border-white/15 bg-white dark:bg-[#141414] overflow-hidden focus-within:border-[#B98A3D] transition-colors"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="flex-1 md:w-72 h-11 bg-transparent px-4 text-sm text-[#0A0A0A] dark:text-[#FAF7F2] placeholder:text-[#0A0A0A]/35 dark:placeholder:text-[#D9CBB4]/40 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 text-sm font-semibold text-[#0A0A0A] bg-[#B98A3D] hover:brightness-95 transition-all"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1 pr-4">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#B98A3D] shadow-sm">
              <LogoAppStore className="size-5 text-[#0A0A0A]" />
            </div>
            <span className="font-serif text-xl font-semibold text-[#0A0A0A] dark:text-[#FAF7F2]">
              {appName}
            </span>
          </Link>
          <p className="text-sm text-[#0A0A0A]/60 dark:text-[#D9CBB4]/70 mt-3 leading-relaxed">
            A marketplace built on independent shops, not one warehouse.
          </p>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-mono text-[#0A0A0A]/70 dark:text-[#D9CBB4]/80">
            <LuStore className="size-3.5 text-[#B98A3D]" />
            1,240+ vendors selling here
          </div>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Sell" links={VENDOR_LINKS} />
        <FooterColumn title="Support" links={SUPPORT_LINKS} />
        <FooterColumn title="Company" links={COMPANY_LINKS} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0A0A0A]/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#0A0A0A]/50 dark:text-[#D9CBB4]/60">
            © {year} {appName}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/legal/privacy"
              className="text-xs text-[#0A0A0A]/50 dark:text-[#D9CBB4]/60 hover:text-[#0A0A0A] dark:hover:text-[#FAF7F2] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-xs text-[#0A0A0A]/50 dark:text-[#D9CBB4]/60 hover:text-[#0A0A0A] dark:hover:text-[#FAF7F2] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/cookies"
              className="text-xs text-[#0A0A0A]/50 dark:text-[#D9CBB4]/60 hover:text-[#0A0A0A] dark:hover:text-[#FAF7F2] transition-colors"
            >
              Cookies
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-8 flex items-center justify-center rounded-full bg-[#0A0A0A]/5 dark:bg-white/5 text-[#0A0A0A]/70 dark:text-[#D9CBB4] hover:bg-[#B98A3D] hover:text-[#0A0A0A] transition-colors"
              >
                <Icon className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#B98A3D] mb-4">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-[#0A0A0A]/70 dark:text-[#D9CBB4]/80 hover:text-[#0A0A0A] dark:hover:text-[#FAF7F2] transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}