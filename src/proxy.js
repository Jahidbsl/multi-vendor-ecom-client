import { NextResponse } from "next/server";

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Get session token from cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("session")?.value;

  // 2. Redirect unauthenticated users
  if (pathname.startsWith("/dashboard") && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify user status & role for dashboard
  if (pathname.startsWith("/dashboard") && sessionToken) {
    try {
      const authRes = await fetch(new URL("/api/auth/get-session", request.url), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (authRes.ok) {
        const session = await authRes.json();
        const role = session?.user?.role;
        const status = session?.user?.status;

        // ⚠️ IF USER/VENDOR IS BLOCKED -> Redirect to /unauthorized?reason=blocked
        if (status === "blocked") {
          return NextResponse.redirect(new URL("/unauthorized?reason=blocked", request.url));
        }

        // ⚠️ IF USER IS NOT ADMIN OR VENDOR -> Redirect to /unauthorized
        if (!role || (role !== "admin" && role !== "vendor")) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Proxy middleware auth error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};