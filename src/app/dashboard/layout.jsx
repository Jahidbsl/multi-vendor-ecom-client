"use client";

import { useState } from "react";
import DashboardTopbar from "@/components/Dashboardtopbar";
import { useAuthUser } from "@/lib/core/Useauthuser";
import Sidebar from "@/components/Sidebar";

// Next.js layout auto-receives children.
// 'title' prop layout এ কাজ করে না, এটি আমরা Topbar এ static বা dynamic রাখতে পারি।
export default function Layout({ children }) {
  const { user, isPending } = useAuthUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d] text-sm text-zinc-500">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d] text-sm text-zinc-500">
        Please log in.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0b0b0d]">
      {/* Sidebar */}
      <Sidebar
        role={user?.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          title="Dashboard"
          role={user?.role}
          user={user}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}