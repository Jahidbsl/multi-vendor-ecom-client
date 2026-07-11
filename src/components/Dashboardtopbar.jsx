"use client";

// components/DashboardTopbar.jsx
// Theme switching uses your existing HeroUI + next-themes setup — this
// component doesn't own or store theme state itself, it just reads/toggles it.
import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";

export default function DashboardTopbar({ title, role, onOpenMobile, user }) {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = theme === "dark";

  function toggleTheme() {
    setTheme(dark ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0b0d]/80 backdrop-blur px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="md:hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base md:text-lg font-bold text-zinc-900 dark:text-white">
          {title}
        </h1>
        <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 capitalize">
          {role} dashboard
        </p>
      </div>

      <div className="ml-2 hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2">
        <Search size={16} className="text-zinc-400" />
        <input
          type="text"
          placeholder="Search orders, products, vendors..."
          className="w-full bg-transparent text-sm text-zinc-700 dark:text-cream-100 placeholder:text-zinc-400 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-amber-500 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-amber-400 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#0b0b0d]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-zinc-900">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </span>
            <ChevronDown size={14} className="hidden sm:block text-zinc-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1c1b20] shadow-xl overflow-hidden">
              <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-white/10">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {user?.name || "Guest"}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={user?.onLogout}
                className="w-full px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/5"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}