"use client";

// app/dashboard/page.jsx

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client"; // Ensure this path matches your auth client setup

function StatCard({ label, value, delta, positive, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/12 text-amber-500">
          <Icon size={18} />
        </span>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            positive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function DashboardContent({ role }) {
  const stats =
    role === "admin"
      ? [
          {
            label: "Platform revenue",
            value: "$128,940",
            delta: "12.4%",
            positive: true,
            icon: DollarSign,
          },
          {
            label: "Total orders",
            value: "3,204",
            delta: "4.1%",
            positive: true,
            icon: ShoppingCart,
          },
          {
            label: "Active vendors",
            value: "1,240",
            delta: "2.3%",
            positive: true,
            icon: Users,
          },
          {
            label: "Listed products",
            value: "18,530",
            delta: "0.8%",
            positive: false,
            icon: Package,
          },
        ]
      : [
          {
            label: "Your revenue",
            value: "$4,210",
            delta: "8.9%",
            positive: true,
            icon: DollarSign,
          },
          {
            label: "Orders this month",
            value: "86",
            delta: "3.2%",
            positive: true,
            icon: ShoppingCart,
          },
          {
            label: "Products live",
            value: "42",
            delta: "1 new",
            positive: true,
            icon: Package,
          },
          {
            label: "Returning buyers",
            value: "31%",
            delta: "1.1%",
            positive: false,
            icon: Users,
          },
        ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Recent orders
          </h2>
          <div className="mt-4 divide-y divide-zinc-100 dark:divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-800 dark:text-cream-100">
                    Order #10{i}2{i}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {role === "admin"
                      ? "Wool Studio Co."
                      : "Leather tote — $118"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                  Fulfilled
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141316] p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {role === "admin" ? "Vendor approvals" : "Payout summary"}
          </h2>
          {role === "admin" ? (
            <ul className="mt-4 space-y-3">
              {["Ceramic & Co.", "North Loom", "Vintage Row"].map((v) => (
                <li
                  key={v}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-700 dark:text-cream-100">{v}</span>
                  <button className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-semibold text-zinc-900">
                    Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                $1,860
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Next payout on Jul 15
              </p>
              <button className="mt-4 w-full rounded-lg bg-amber-400 py-2 text-sm font-semibold text-zinc-900">
                View payout history
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;

  return <DashboardContent role={role} />;
}