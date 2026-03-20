"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, AuthError } from "firebase/auth";
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

// ─── useSearchParams を使う部分を切り出して Suspense で囲む ──────────────────
// Next.js App Router では useSearchParams() は Suspense boundary が必須

function SignInInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, loading } = useAuth();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams(); // ← Suspense内なのでOK
  const hasRedirected = useRef(false);

  const callbackUrl = searchParams.get("callbackUrl");

  // ─── ログイン後のリダイレクト ─────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.replace(callbackUrl);
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace(`/orders/${user.id}`);
    }
  }, [user, loading, router, callbackUrl]);

  // ─── メールサインイン ─────────────────────────────────────────────────
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSnackbar("ログインしました", "success");
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      setIsProcessing(false);
    }
  };

  // ─── Googleサインイン ─────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <Image src="/spirit.webp" alt="Spirit Logo" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8 text-slate-800">Sign In</h1>

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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Or</span>
          </div>
        </div>

        <button type="button" onClick={handleGoogleSignIn} disabled={isProcessing} className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3.5 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" aria-hidden="true" />
          Continue with Google
        </button>

        <div className="mt-8 text-center">
          <a href="/signup" className="text-sm font-bold text-blue-500 hover:underline">
            新規登録はこちら
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Suspense でラップしてエクスポート ────────────────────────────────────────

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

export default function SignInClient() {
  return (
    <Suspense fallback={<Spinner />}>
      <SignInInner />
    </Suspense>
  );
}
