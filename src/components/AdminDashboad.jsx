"use client";
import { authClient } from "@/lib/auth-client";

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();

  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return <p>Access Denied! You are not an admin.</p>;
  }

  return (
    <div>
      <h1>Welcome to Admin Dashboard</h1>
    </div>
  );
}