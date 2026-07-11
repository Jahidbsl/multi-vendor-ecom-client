// components/dashboard-config.js
// Central place that defines what each role sees in the sidebar.
// Add / remove links here — Sidebar.jsx just renders whatever this returns.

import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Tags,
  MessageSquare,
  Star,
  Percent,
  FileText,
  ShieldCheck,
  Boxes,
  Truck,
} from "lucide-react";

export const ADMIN_LINKS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Marketplace",
    items: [
      { label: "Vendors", href: "/dashboard/admin/vendors", icon: Store, badge: "6" },
      { label: "Products", href: "/dashboard/admin/products", icon: Package },
      { label: "Orders", href: "/dashboard/admin/orders", icon: ShoppingCart },
      { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
      { label: "Deals", href: "/dashboard/admin/deals", icon: Percent },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Customers", href: "/dashboard/admin/customers", icon: Users },
      { label: "Payouts", href: "/dashboard/admin/payouts", icon: Wallet },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Reports", href: "/dashboard/admin/reports", icon: FileText },
      { label: "Moderation", href: "/dashboard/admin/moderation", icon: ShieldCheck },
      { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ],
  },
];

export const VENDOR_LINKS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/vendor", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/vendor/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Store",
    items: [
      { label: "Products", href: "/dashboard/vendor/products", icon: Boxes },
      { label: "Orders", href: "/dashboard/vendor/orders", icon: ShoppingCart, badge: "3" },
      { label: "Shipping", href: "/dashboard/vendor/shipping", icon: Truck },
      { label: "Reviews", href: "/dashboard/vendor/reviews", icon: Star },
    ],
  },
  {
    group: "Business",
    items: [
      { label: "Earnings", href: "/dashboard/vendor/earnings", icon: Wallet },
      { label: "Messages", href: "/dashboard/vendor/messages", icon: MessageSquare },
    ],
  },
  {
    group: "Store settings",
    items: [{ label: "Settings", href: "/dashboard/vendor/settings", icon: Settings }],
  },
];

// role: "admin" | "vendor"
export function getSidebarLinks(role) {
  return role === "admin" ? ADMIN_LINKS : VENDOR_LINKS;
}