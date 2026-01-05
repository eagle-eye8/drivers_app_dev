"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------
  // 共通：FireStore側のユーザー作成をバックエンドに依頼
  // ---------------------
  const createUserInBackend = async (uid: string, email: string) => {
    await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email }),
    });
  };

  // ---------------------
  // Email & Password SignUp
  // ---------------------
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ① Firebase Auth でユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ② バックエンド API にユーザー情報を送信
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save user in Firestore");
      }

      // ③ UID付き orders 画面へ遷移
      router.push(`/orders/${user.uid}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------
  // Google SignUp
  // ---------------------
  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ① Firebase Auth でユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ② バックエンド API にユーザー情報を送信
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save user in Firestore");
      }

      // ③ UID付き orders 画面へ遷移
      router.push(`/orders/${user.uid}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign Up</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/40" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/40" required />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded-lg hover:bg-black/80 transition">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4">
          <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
        <div className="mt-6 text-center text-sm space-y-2">
          <a href="/signin" className="text-blue-600 hover:underline">
            サインインはこちら
          </a>
        </div>
      </div>
    </div>
  );
}
