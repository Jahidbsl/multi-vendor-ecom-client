"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Lock, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const isBlocked = searchParams.get("reason") === "blocked";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-[#0b0b0d] px-4 text-center">
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-center">
          <span className={`p-4 rounded-full ${isBlocked ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
            {isBlocked ? <Lock size={48} /> : <ShieldAlert size={48} />}
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
          {isBlocked ? "Account Suspended" : "Access Denied"}
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {isBlocked
            ? "Your vendor account has been blocked by the admin. Please contact support if you believe this is a mistake."
            : "You do not have permission to access the dashboard. Admin or Vendor access is required."}
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-amber-400 hover:bg-amber-500 py-3 text-sm font-semibold text-zinc-900 transition-colors"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}