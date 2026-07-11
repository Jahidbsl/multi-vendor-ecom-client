"use client";

// components/useAuthUser.js
// Small wrapper around better-auth's client session hook so Sidebar /
// Topbar always get a consistent { name, email, role, avatarUrl, onLogout }
// shape, no matter what your layout looks like.
//
// Adjust the import path to wherever you created your better-auth client
// (usually lib/auth-client.js):
//
//   import { createAuthClient } from "better-auth/react";
//   export const authClient = createAuthClient();

import { authClient } from "@/lib/auth-client";

export function useAuthUser() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        // fallback to "vendor" if a role is somehow missing, so the UI
        // never breaks — but your DB should always set one on signup.
        role: session.user.role === "admin" ? "admin" : "vendor",
        avatarUrl: session.user.image,
        onLogout: () => authClient.signOut(),
      }
    : null;

  return { user, isPending };
}