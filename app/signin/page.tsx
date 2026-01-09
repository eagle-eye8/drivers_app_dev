"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAuth } from "../providers/AuthProvider";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // ログイン処理中のローカル状態
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  // ---------------------
  // 🔄 モバイルリダイレクト後の結果取得
  // ---------------------
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await handleRedirectAfterLogin(result.user);
        }
      } catch (err: any) {
        console.error(err);
        setError("Googleログイン中にエラーが発生しました。");
      }
    };
    checkRedirect();
  }, []);

  // ---------------------
  // 🔥 共通：ログイン後のリダイレクト処理
  // ---------------------
  const handleRedirectAfterLogin = async (user: User) => {
    setIsProcessing(true);
    try {
      // カスタムクレーム（admin）を含む最新のトークン結果を取得
      const tokenResult = await user.getIdTokenResult();
      const token = tokenResult.token;
      // ① session cookie 保存 (API呼び出し)
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("セッション作成失敗");
      }

      // ② 権限に基づいた遷移先の決定
      if (tokenResult.claims.admin === true) {
        window.location.replace("/admin/dashboard"); // 管理者ダッシュボードへ
      } else {
        window.location.replace(`/order/${user.uid}`); // 一般トップへ
      }
    } catch (err) {
      console.error(err);
      setError("ログイン処理中にエラーが発生しました");
      setIsProcessing(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRedirectAfterLogin(userCredential.user);
    } catch (err: any) {
      setIsProcessing(false);
      // 簡単なエラーハンドリング
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else {
        setError("ログインに失敗しました。時間をおいて再度お試しください。");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        // スマホの場合はリダイレクト方式
        await signInWithRedirect(auth, provider);
        // この後はページが切り替わるため、戻ってきた時にuseEffect内のgetRedirectResultが走る
      } else {
        setIsProcessing(true);
        const result = await signInWithPopup(auth, provider);
        await handleRedirectAfterLogin(result.user);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError("Googleログインに失敗しました。");
    }
  };

  // AuthProviderの初期ロード中、またはログイン処理中
  if (authLoading || isProcessing) return <LoadingOverlay text="ログインしています…" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
          </div>

          {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Sign In
          </button>
        </form>

        <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg mt-4 hover:bg-gray-50 transition-colors">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm space-y-2">
          <a href="/reset-password" disposable-label="true" className="block text-blue-600 hover:underline">
            パスワードをお忘れですか？
          </a>
          <a href="/signup" disposable-label="true" className="block text-blue-600 hover:underline">
            新規登録はこちら
          </a>
        </div>
      </div>
    </div>
  );
}
