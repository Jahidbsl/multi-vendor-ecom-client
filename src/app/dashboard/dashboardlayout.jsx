"use client";

// EXAMPLE: your own custom layout, using the same Sidebar + Topbar
// but wired directly to better-auth instead of the DashboardLayout wrapper.

import { useState } from "react";
import DashboardTopbar from "@/components/Dashboardtopbar";
import { useAuthUser } from "@/lib/core/Useauthuser";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children, title = "Dashboard" }) {
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
    // no session → not logged in, handle however you like
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d] text-sm text-zinc-500">
        Please log in.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0b0b0d]">
      {/* Same Sidebar, role comes straight from the session */}
      <Sidebar
        role={user.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
      />

      {/* Your own layout structure goes here — sidebar stays fixed,
          only this part changes between pages/layouts */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          title={title}
          role={user.role}
          user={user}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}