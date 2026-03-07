import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route 定義 ──────────────────────────────────────────────────────────────

const PROTECTED_PREFIXES = ["/admin", "/orders"] as const;
const AUTH_PREFIXES = ["/signin", "/signup"] as const;

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthPage(pathname: string) {
  return AUTH_PREFIXES.some((p) => pathname.startsWith(p));
}

// ─── JWT ペイロード簡易検証 ───────────────────────────────────────────────────
/**
 * Edge Runtimeでは firebase-admin が使えないため、
 * JWTのペイロードをデコードして有効期限(exp)だけ確認する軽量検証を行う。
 *
 * ⚠️ 署名検証はしていない。完全なセキュリティが必要な場合は
 *    /api/auth/verify などのRoute Handlerで firebase-admin を使うこと。
 *
 * Firebase IDトークンの有効期限は最大1時間。
 * クライアント側の onIdTokenChanged が自動リフレッシュするため、
 * 期限切れCookieが長時間残り続けるリスクは低い。
 */
function isTokenExpired(token: string): boolean {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return true;

    // Base64url → JSON
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };

    if (!payload.exp) return true;

    // 30秒のバッファを設けてギリギリの期限切れを防ぐ
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  // トークンの有効性チェック（存在 + 有効期限）
  const isAuthenticated = !!token && !isTokenExpired(token);

  // ── 保護ルート: 未認証ならサインインページへ ──────────────────────────────
  if (isProtected(pathname)) {
    if (!isAuthenticated) {
      const signinUrl = new URL("/signin", request.url);
      // サインイン後に元のページへリダイレクトするためにcallbackUrlを付与
      signinUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  // ── 認証ページ: 認証済みならダッシュボードへ ─────────────────────────────
  if (isAuthPage(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico
     * - public フォルダ内のファイル
     * - api ルート (独自の認証処理がある場合)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
