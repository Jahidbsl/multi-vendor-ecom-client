"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Bars,
  Heart,
  LogoAppStore,
  Magnifier,
  Moon,
  Person,
  ShoppingBag,
  Sun,
  Xmark,
  ChevronDown,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import { LuLayoutDashboard, LuStore } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import { getCartItems } from "@/lib/api/cart";
import { getAdminCategories } from "@/lib/api/categories";
import Image from "next/image";

const FALLBACK_CATEGORIES = ["All departments"];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [category, setCategory] = useState(FALLBACK_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;
  const sessionReady = mounted && !isPending;

  useEffect(() => {
    setMounted(true);
    
    async function fetchCategories() {
      try {
        const res = await getAdminCategories();
        const fetchedCats = Array.isArray(res) ? res : res?.data || [];
        const finalCats = ["All departments", ...fetchedCats.filter(c => {
          const name = typeof c === "object" && c !== null ? (c.name || c.title) : c;
          return name && name !== "All departments";
        })];
        setCategories(finalCats);
        setCategory(finalCats[0]);
      } catch (error) {
        console.warn("Failed to fetch categories:", error);
      }
    }

    fetchCategories();
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    try {
      const res = await getCartItems(userId);

      if (res?.success && Array.isArray(res.data)) {
        const totalQty = res.data.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0,
        );
        setCartCount(totalQty);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.warn("Cart fetch issue:", error.message);
    }
  }, [userId]);

  const fetchWishlistCount = useCallback(async () => {
    if (!userId) {
      setWishlistCount(0);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/wishlist`, {
        cache: "no-store",
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setWishlistCount(data.data.length);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.warn("Wishlist fetch issue:", error.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCartCount();
        fetchWishlistCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("storage", handleWishlistUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("storage", handleWishlistUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [fetchCartCount, fetchWishlistCount]);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse";

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && category === categories[0]) return;
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    
    if (category && category !== categories[0]) {
      params.set("category", category);
    }

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth/signin";
        },
      },
    });
  };

  const userRole = user?.role?.toLowerCase();
  const isVendorOrAdmin = userRole === "vendor" || userRole === "admin";
  const dashboardLink = isVendorOrAdmin ? "/dashboard" : "/account";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]">
      <div className="hidden sm:block border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-xs text-[#D9CBB4]">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <LuStore className="size-3.5 text-[#B98A3D]" />
            <span className="font-mono text-[11px]">1,240+</span>
            <span>independent vendors selling here</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/vendors/apply"
              className="hover:text-white transition-colors"
            >
              Become a vendor
            </Link>
            <Link
              href="/my-orders"
              className="hover:text-white transition-colors"
            >
              Track order
            </Link>
            <Link href="/helps" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF7F2] dark:bg-[#0A0A0A] border-b border-[#0A0A0A]/10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <Button
              isIconOnly
              variant="light"
              className="lg:hidden text-[#0A0A0A] dark:text-[#FAF7F2]"
              onPress={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <Xmark className="size-5" />
              ) : (
                <Bars className="size-5" />
              )}
            </Button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#B98A3D] shadow-sm transition-transform group-hover:scale-105">
                <LogoAppStore className="size-5 text-[#0A0A0A]" />
              </div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#FAF7F2]">
                {appName}
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full items-stretch rounded-lg border border-[#0A0A0A]/15 dark:border-white/15 bg-white dark:bg-[#141414] overflow-hidden focus-within:border-[#B98A3D] transition-colors">
              <div className="relative flex items-center border-r border-[#0A0A0A]/10 dark:border-white/10">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Search category"
                  className="h-full appearance-none bg-transparent pl-3 pr-7 text-xs font-medium text-[#0A0A0A]/70 dark:text-[#D9CBB4] focus:outline-none cursor-pointer"
                >
                  {categories.map((c, index) => {
                    const categoryName = typeof c === "object" && c !== null ? (c.name || c.title || JSON.stringify(c)) : c;
                    const categoryKey = typeof c === "object" && c !== null ? (c._id || c.id || index) : c;
                    return (
                      <option key={categoryKey} value={categoryName} className="bg-white dark:bg-[#141414] text-[#0A0A0A] dark:text-[#FAF7F2]">
                        {categoryName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 size-3 text-[#0A0A0A]/40 dark:text-[#D9CBB4]/60" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${appName}...`}
                className="flex-1 h-11 bg-transparent px-3 text-sm text-[#0A0A0A] dark:text-[#FAF7F2] placeholder:text-[#0A0A0A]/40 dark:placeholder:text-[#D9CBB4]/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-4 bg-[#B98A3D] hover:brightness-95 text-[#0A0A0A] font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Magnifier className="size-4" />
              </button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#0A0A0A]/70 dark:text-[#D9CBB4] shrink-0">
            <Link
              href="/products"
              className="hover:text-[#B98A3D] transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/vendors"
              className="hover:text-[#B98A3D] transition-colors"
            >
              Stores
            </Link>
            <Link
              href="/deals"
              className="hover:text-[#B98A3D] transition-colors"
            >
              Deals
            </Link>
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              isIconOnly
              variant="light"
              className="text-[#0A0A0A] dark:text-[#FAF7F2]"
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
            >
              {!mounted ? (
                <div className="size-5" />
              ) : theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>

            <Link
              href="/wishlist"
              className="hidden sm:relative sm:inline-flex items-center justify-center p-2 rounded-lg text-[#0A0A0A] dark:text-[#FAF7F2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-sm bg-[#B98A3D] px-1 font-mono text-[10px] font-bold text-[#0A0A0A] shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center p-2 rounded-lg text-[#0A0A0A] dark:text-[#FAF7F2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-sm bg-[#9C4A32] px-1 font-mono text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {!sessionReady ? (
              <div className="size-9 rounded-full bg-[#0A0A0A]/10 dark:bg-white/10 animate-pulse" />
            ) : user ? (
              <Dropdown>
                <Button
                  aria-label="User Menu"
                  variant="light"
                  className="p-0 min-w-0 rounded-full"
                >
                  <div className="relative size-9 rounded-full ring-2 ring-offset-2 ring-offset-[#FAF7F2] dark:ring-offset-[#0A0A0A] ring-[#B98A3D]/40 hover:ring-[#B98A3D] transition-all overflow-hidden">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="bg-[#B98A3D] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center h-full w-full">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                </Button>

                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu aria-label="User Actions" className="w-64">
                    <Dropdown.Item id="user-info" textValue="Signed in email">
                      <div className="flex flex-col py-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Signed in as
                        </span>
                        <span className="font-semibold text-sm truncate">
                          {user.email}
                        </span>
                      </div>
                    </Dropdown.Item>

                    {isVendorOrAdmin && (
                      <Dropdown.Item
                        id="dashboard"
                        textValue="Dashboard"
                        href="/dashboard"
                      >
                        <div className="flex items-center gap-2">
                          <LuLayoutDashboard className="size-4" />
                          <Label>Dashboard</Label>
                        </div>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      id="my-orders"
                      textValue="My Orders"
                      href="/my-orders"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="size-4" />
                        <Label>My Orders</Label>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      id="wishlist"
                      textValue="Wishlist"
                      href="/wishlist"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="size-4" />
                        <Label>Wishlist</Label>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      id="account"
                      textValue="Profile & Settings"
                      href="/account"
                    >
                      <div className="flex items-center gap-2">
                        <Person className="size-4" />
                        <Label>Profile & Settings</Label>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      id="logout"
                      textValue="Sign Out"
                      variant="danger"
                      onAction={handleSignOut}
                    >
                      <div className="flex items-center gap-2">
                        <FaArrowRight className="size-4" />
                        <Label>Sign Out</Label>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-lg bg-[#B98A3D] text-[#0A0A0A] text-sm font-semibold hover:brightness-95 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden px-4 pb-3.5">
          <form onSubmit={handleSearch} className="flex items-stretch rounded-lg border border-[#0A0A0A]/15 dark:border-white/15 bg-white dark:bg-[#141414] overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${appName}...`}
              className="flex-1 h-11 bg-transparent px-3 text-sm text-[#0A0A0A] dark:text-[#FAF7F2] placeholder:text-[#0A0A0A]/40 dark:placeholder:text-[#D9CBB4]/50 focus:outline-none"
            />
            <button type="submit" className="px-4 bg-[#B98A3D] text-[#0A0A0A] font-semibold text-xs flex items-center gap-1">
              <Magnifier className="size-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {isOpen && (
        <nav className="lg:hidden border-b border-white/10 bg-[#0A0A0A] px-4 py-4 flex flex-col gap-1 text-base font-medium text-[#FAF7F2]">
          <Link
            href="/products"
            className="py-2.5"
            onClick={() => setIsOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/vendors"
            className="py-2.5"
            onClick={() => setIsOpen(false)}
          >
            Stores
          </Link>
          <Link
            href="/deals"
            className="py-2.5"
            onClick={() => setIsOpen(false)}
          >
            Deals
          </Link>
          <Link
            href="/wishlist"
            className="py-2.5 flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="bg-[#B98A3D] text-[#0A0A0A] text-xs px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/sell"
            className="py-2.5 text-[#B98A3D]"
            onClick={() => setIsOpen(false)}
          >
            Become a vendor
          </Link>

          {sessionReady && !user && (
            <Link
              href="/auth/signin"
              className="py-2.5 text-[#B98A3D] font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          )}
          {sessionReady && user && (
            <Link
              href={dashboardLink}
              className="py-2.5 text-[#B98A3D] font-semibold"
              onClick={() => setIsOpen(false)}
            >
              {isVendorOrAdmin ? "Dashboard" : "Account Settings"}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}