"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // Imageコンポーネント
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------
  // Email & Password SignUp
  // ---------------------
const handleEmailSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const res = await fetch("/api/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.uid, email: user.email }),
    });

    if (!res.ok) throw new Error("Failed to save user");

    // ★成功したら適切な場所へリダイレクト
    // window.location.href を使うと AuthProvider の状態がリセットされて確実です
    window.location.href = "/admin/dashboard"; 

  } catch (err: any) {
    console.error(err);
    alert(err.message); // エラー内容を表示して確認
    setLoading(false);
  }
};
  // ---------------------
  // Google SignUp (正しく修正)
  // ---------------------
  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // ① ポップアップでGoogle認証
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // ② バックエンド API に送信
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.uid, email: user.email }),
      });

      if (!res.ok) throw new Error("Failed to save user");
    } catch (err: any) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-[family-name:var(--font-outfit)]">
      <div className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50">
        {/* Gemini風おしゃれロゴエリア */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-14 h-14 mb-4 rounded-2xl overflow-hidden shadow-md border border-slate-100 transition-transform hover:scale-105 duration-300">
            <Image src="/spirit.webp" alt="Spirit Logo" fill className="object-cover" />
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold tracking-tighter text-slate-800">Spirit</span>
            <span className="ml-1 flex gap-0.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-2 font-medium">Create your account</p>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all outline-none text-slate-800 placeholder:text-slate-300" placeholder="name@example.com" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all outline-none text-slate-800" placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-slate-100 py-3.5 rounded-2xl hover:bg-slate-50 transition-all font-semibold text-slate-700 active:scale-[0.98]">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>

        <div className="mt-8 text-center">
          <a href="/signin" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            Already have an account? Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
