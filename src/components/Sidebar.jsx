"use client";

// components/Sidebar.jsx
// Smart, role-aware sidebar for the ShopVerse dashboard.
// - Desktop (lg+): fixed sidebar, collapsible to an icon rail
// - Tablet (md): icon rail by default, expands on toggle
// - Mobile: off-canvas drawer with overlay
//
// Usage:
// <Sidebar role={user.role} collapsed={collapsed} mobileOpen={mobileOpen}
//          onCloseMobile={() => setMobileOpen(false)} />

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { getSidebarLinks } from "./dashboard-config";

const RAIL_WIDTH = 76;
const FULL_WIDTH = 264;

function Brand({ collapsed }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b border-zinc-200 dark:border-white/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-zinc-900 font-black text-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
        A
      </span>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
          Shop<span className="text-amber-500">Verse</span>
        </span>
      )}
    </Link>
  );
}

function RoleBadge({ role, collapsed }) {
  if (collapsed) return null;
  const isAdmin = role === "admin";
  return (
    <div className="px-4 pt-4 pb-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
          isAdmin
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
            : "bg-amber-400/15 text-amber-600 dark:text-amber-400"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isAdmin ? "bg-violet-500" : "bg-amber-400"
          }`}
        />
        {isAdmin ? "Admin workspace" : "Vendor workspace"}
      </span>
    </div>
  );
}

function NavGroup({ group, collapsed, pathname, onNavigate }) {
  return (
    <div className="mb-1">
      {!collapsed && (
        <p className="px-4 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {group.group}
        </p>
      )}
      <ul className="px-2 space-y-0.5">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-amber-400/12 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-cream-50"
                  }
                  ${collapsed ? "justify-center" : ""}`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400" />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className="shrink-0"
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UserFooter({ user, collapsed }) {
  return (
    <div className="mt-auto border-t border-zinc-200 dark:border-white/10 p-3">
      <div
        className={`flex items-center gap-2.5 rounded-lg p-1.5 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-white/10 text-sm font-bold text-zinc-700 dark:text-cream-100 overflow-hidden">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user?.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            (user?.name || "U").slice(0, 1).toUpperCase()
          )}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {user?.name || "Guest user"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user?.email || "—"}
            </p>
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={user?.onLogout}
            title="Log out"
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarInner({ role, collapsed, user, onNavigate, onToggleCollapse, isMobile }) {
  const pathname = usePathname();
  const groups = getSidebarLinks(role);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#141316]">
      <Brand collapsed={collapsed} />
      <RoleBadge role={role} collapsed={collapsed} />
      <nav className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {groups.map((group) => (
          <NavGroup
            key={group.group}
            group={group}
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <UserFooter user={user} collapsed={collapsed} />
      {!isMobile && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center justify-center gap-2 border-t border-zinc-200 dark:border-white/10 py-2.5 text-xs font-medium text-zinc-500 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && "Collapse"}
        </button>
      )}
    </div>
  );
}

export default function Sidebar({
  role = "vendor",
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  user,
}) {
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <motion.aside
        animate={{ width: collapsed ? RAIL_WIDTH : FULL_WIDTH }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className="hidden md:block shrink-0 border-r border-zinc-200 dark:border-white/10 h-screen sticky top-0"
      >
        <SidebarInner
          role={role}
          collapsed={collapsed}
          user={user}
          onToggleCollapse={onToggleCollapse}
        />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[82vw] md:hidden shadow-2xl"
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
                <SidebarInner
                  role={role}
                  collapsed={false}
                  user={user}
                  onNavigate={onCloseMobile}
                  isMobile
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}