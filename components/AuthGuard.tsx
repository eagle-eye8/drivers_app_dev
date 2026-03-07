"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  /** 特定ロールのみアクセス許可。未指定の場合はログイン済みであれば全ロール許可 */
  requiredRole?: "admin" | "driver";
};

/**
 * AuthGuard
 *
 * 設計方針:
 * 1. Middlewareが第一の防衛線（サーバーサイド）
 * 2. AuthGuardが第二の防衛線（クライアントサイド、ロールベースの制御）
 * 3. ローディング中は何も描画しない（レイアウトシフト防止）
 * 4. リダイレクトは一度だけ実行（router.push の二重発火防止）
 */
export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasRedirected.current) return;

    // 未ログイン → サインインへ
    if (!user) {
      hasRedirected.current = true;
      router.replace("/signin");
      return;
    }

    // ロール不一致 → 権限エラーまたはリダイレクト
    if (requiredRole && user.role !== requiredRole) {
      hasRedirected.current = true;
      // adminでない場合は自分のオーダーページへ
      router.replace(
        user.role === "admin" ? "/admin/dashboard" : `/orders/${user.uid}`
      );
      return;
    }
  }, [user, loading, router, requiredRole]);

  // ローディング中または未認証状態では何も描画しない
  // （Middlewareがあるため、このケースは短時間のみ）
  if (loading || !user) {
    return null;
  }

  // ロール不一致の場合も描画しない
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
