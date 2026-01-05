import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // =========================
  // 絶対に触らない領域
  // =========================
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/__/auth") || // ← ★超重要
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // =========================
  // admin 配下のみガード
  // =========================
  if (pathname.startsWith("/admin")) {
    const session = req.cookies.get("session")?.value;

    if (!session) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("reason", "session_expired");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
