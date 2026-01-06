"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, // 追加
  getRedirectResult,  // 追加
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "@/components/ui/SnackbarProvider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const reason = params.get("reason");
  const { showSnackbar } = useSnackbar();
  const shownRef = useRef(false);

  // ---------------------
  // 🔥 共通：ログイン後のリダイレクト処理
  // ---------------------
  const handleRedirectAfterLogin = async (user: User) => {
    try {
      const token = await user.getIdToken();
      
      // ① session cookie 保存
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });

      if (!res.ok) {
        setError("ログインセッションの作成に失敗しました");
        return;
      }

      // ② SSR 経由で admin 判定
      const adminRes = await fetch("/api/auth/check-admin");
      if (!adminRes.ok) {
        setError("権限チェックに失敗しました");
        return;
      }

      const data = await adminRes.json();

      if (data.admin) {
        router.replace("/admin/dashboard");
      } else {
        router.replace(`/orders/${user.uid}`);
      }
    } catch (err) {
      console.error(err);
      setError("ログイン処理中にエラーが発生しました");
    }
  };

  // ---------------------
  // 🔥 追加：リダイレクトから戻ってきた時の処理
  // ---------------------
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);
          await handleRedirectAfterLogin(result.user);
        }
      } catch (err: any) {
        console.error(err);
        setError("Googleログイン中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    checkRedirectResult();
  }, []);

  // セッション切れの通知
  useEffect(() => {
    if (reason === "session_expired" && !shownRef.current) {
      shownRef.current = true;
      showSnackbar("一定時間操作がなかったため、再ログインが必要です", "warning");
      const url = new URL(window.location.href);
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, [reason, showSnackbar]);

  // ---------------------
  // Email SignIn
  // ---------------------
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRedirectAfterLogin(userCredential.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ---------------------
  // Google SignIn (スマホ対応版)
  // ---------------------
  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    
    // モバイル端末かどうかを簡易判定
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        // スマホの場合はリダイレクト方式（ポップアップブロックを回避）
        setLoading(true); // 遷移前にローディング表示
        await signInWithRedirect(auth, provider);
      } else {
        // PCの場合はポップアップ方式
        setLoading(true);
        const result = await signInWithPopup(auth, provider);
        await handleRedirectAfterLogin(result.user);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay text="ログインしています…" />}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded-lg">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg mt-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm space-y-2">
            <a href="/reset-password" disposable-label="true" className="text-blue-600 hover:underline">
              パスワードをお忘れですか？
            </a>
            <div>
              <a href="/signup" disposable-label="true" className="text-blue-600 hover:underline">
                新規登録はこちら
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
