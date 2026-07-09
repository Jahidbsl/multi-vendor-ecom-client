"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";
import { Avatar, Button, Dropdown, InputGroup, Label } from "@heroui/react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ShopVerse";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/95 dark:border-gray-800/70 dark:bg-gray-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            className="md:hidden"
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
            <div className="h-9 w-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg transition-transform group-hover:scale-105">
              <LogoAppStore className="size-5 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {appName}
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <InputGroup className="w-full">
            <InputGroup.Input
              placeholder={`Search on ${appName}...`}
              className="h-11 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-full"
            />
            <InputGroup.Suffix>
              <Button isIconOnly variant="light" className="text-gray-500">
                <Magnifier className="size-5" />
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link
            href="/products"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/vendors"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Stores
          </Link>
          <Link
            href="/deals"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Deals
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            isIconOnly
            variant="light"
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

          {/* Wishlist */}
          <Button isIconOnly variant="light" as={Link} href="/wishlist">
            <Heart className="size-5" />
          </Button>

          {/* Cart */}
          <Button
            isIconOnly
            variant="light"
            as={Link}
            href="/cart"
            className="relative"
          >
            <ShoppingBag className="size-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
              3
            </span>
          </Button>

          {/* User Dropdown */}
          {user ? (
            <Dropdown>
              <Button
                aria-label="User Menu"
                variant="light"
                className="p-0 min-w-0 rounded-full"
              >
                <Avatar className="size-9 cursor-pointer ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-blue-500/30 hover:ring-blue-500 transition-all">
                  {user?.image ? (
                    <Avatar.Image
                      src={user.image}
                      alt={user.name || "User"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <Avatar.Fallback className="bg-blue-600 text-white font-medium text-sm flex items-center justify-center h-full w-full">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </Avatar.Fallback>
                </Avatar>
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

                  <Dropdown.Item
                    id="orders"
                    textValue="My Orders"
                    href="/orders"
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
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <InputGroup>
          <InputGroup.Input
            placeholder={`Search on ${appName}...`}
            className="h-11 rounded-full"
          />
          <InputGroup.Suffix>
            <Button isIconOnly variant="light">
              <Magnifier className="size-5" />
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 flex flex-col gap-3 text-base font-medium">
          <Link
            href="/products"
            className="py-2"
            onClick={() => setIsOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/vendors"
            className="py-2"
            onClick={() => setIsOpen(false)}
          >
            Stores
          </Link>
          <Link href="/deals" className="py-2" onClick={() => setIsOpen(false)}>
            Deals
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="py-2 text-blue-600 dark:text-blue-400 font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="py-2 text-blue-600 dark:text-blue-400 font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
