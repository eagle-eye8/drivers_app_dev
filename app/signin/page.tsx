"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "@/components/ui/SnackbarProvider";

// ─── エラーメッセージ変換 ─────────────────────────────────────────────────────

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません",
  "auth/user-disabled": "このアカウントは無効化されています",
  "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってから再試行してください",
  "auth/network-request-failed": "ネットワークエラーが発生しました",
  "auth/popup-blocked": "ポップアップがブロックされました",
  "auth/cancelled-popup-request": "サインインがキャンセルされました",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && "code" in error) {
    const authError = error as AuthError;
    return AUTH_ERROR_MESSAGES[authError.code] ?? "ログインに失敗しました";
  }
  return "予期しないエラーが発生しました";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true); // Googleリダイレクト結果確認中

  const { user, loading } = useAuth();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  // callbackUrl: Middlewareが付与したリダイレクト先（例: "/admin/orders"）
  const callbackUrl = searchParams.get("callbackUrl");

  // ─── Googleリダイレクト結果の処理 ──────────────────────────────────────
  // ページロード時に一度だけ実行。サインイン成功後にAuthProviderのonIdTokenChangedが発火する。
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          showSnackbar("Googleアカウントでログインしました", "success");
        }
      })
      .catch((err) => {
        const msg = getErrorMessage(err);
        showSnackbar(msg, "error");
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── ログイン後のリダイレクト ───────────────────────────────────────────
  useEffect(() => {
    if (loading) return;  // AuthProviderのloadingだけ見れば十分
    if (!user) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    // callbackUrl がある場合はそちらを優先（XSS対策: 同一オリジンのみ許可）
    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.replace(callbackUrl);
      return;
    }

    // ロールに応じたデフォルトリダイレクト
    if (user.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace(`/orders/${user.uid}`);
    }
  }, [user, loading, googleLoading, router, callbackUrl]);

  // ─── メールサインイン ───────────────────────────────────────────────────
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSnackbar("ログインしました", "success");
      // ← ここではリダイレクトしない。上のuseEffectがuserの変化を検知して処理する
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      setIsProcessing(false); // エラー時のみ解除（成功時はリダイレクト中なのでtrue維持）
    }
  };

  // ─── Googleサインイン ───────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      // callbackUrlをセッションストレージに保存（リダイレクト後に復元）
      if (callbackUrl) {
        sessionStorage.setItem("authCallbackUrl", callbackUrl);
      }
      await signInWithRedirect(auth, provider);
      // ↑ この後ページ遷移するのでsetIsProcessing(false)は不要
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      setIsProcessing(false);
    }
  };

  // ─── ロード中はフォームを表示しない ────────────────────────────────────
  // Googleリダイレクトから戻ってきた直後のちらつきを防ぐ
  if (googleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // すでにログイン済みの場合は何も描画しない（useEffectがリダイレクト処理中）
  if (user) return null;

  // ─── UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        {/* ロゴ */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <Image src="/spirit.webp" alt="Spirit Logo" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8 text-slate-800">Sign In</h1>

        {/* メールフォーム */}
        <form onSubmit={handleEmailSignIn} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" required autoComplete="email" disabled={isProcessing} />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Password
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-shadow" required autoComplete="current-password" disabled={isProcessing} />
          </div>
          <button type="submit" disabled={isProcessing || !email || !password} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                処理中...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* 区切り線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Or</span>
          </div>
        </div>

        {/* Googleサインイン */}
        <button type="button" onClick={handleGoogleSignIn} disabled={isProcessing} className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3.5 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" aria-hidden="true" />
          Continue with Google
        </button>

        {/* リンク */}
        <div className="mt-8 text-center">
          <a href="/signup" className="text-sm font-bold text-blue-500 hover:underline">
            新規登録はこちら
          </a>
        </div>
      </div>
    </div>
  );
}
