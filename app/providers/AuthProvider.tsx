"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie, deleteCookie } from "cookies-next";
import { SigninUser } from "@/types/signinUser";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthContextType = {
  user: SigninUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

// ─── キャッシュ ───────────────────────────────────────────────────────────────

const userCache = new Map<string, SigninUser>();

// ─── API経由でユーザー情報取得 ────────────────────────────────────────────────
/**
 * フロントから直接Firestoreを叩かずAPIルート経由にする。
 * 理由: onIdTokenChanged発火直後はFirestore SDKがトークンを
 * まだ内部反映していないため "client is offline" エラーが起きる。
 * APIルートはadminDbを使うためクライアントの認証状態に依存しない。
 */
async function fetchUserFromApi(token: string, uid: string, forceRefresh = false): Promise<SigninUser> {
  if (!forceRefresh && userCache.has(uid)) {
    return userCache.get(uid)!;
  }

  const res = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`/api/me failed: ${res.status}`);
  }

  const data = await res.json();
  const appUser: SigninUser = data.user;
  userCache.set(uid, appUser);
  return appUser;
}

// ─── Cookie 管理 ─────────────────────────────────────────────────────────────

const SESSION_COOKIE = "session";
const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 } as const;

function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SigninUser | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!firebaseUserRef.current || !tokenRef.current) return;
    try {
      const updated = await fetchUserFromApi(tokenRef.current, firebaseUserRef.current.uid, true);
      setUser(updated);
    } catch (err) {
      console.error("refreshUser failed:", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      firebaseUserRef.current = firebaseUser;

      if (!firebaseUser) {
        setUser(null);
        tokenRef.current = null;
        clearSessionCookie();
        setLoading(false);
        return;
      }

      try {
        // トークン取得 → Cookie保存 → API呼び出し（直列）
        const token = await firebaseUser.getIdToken(false);
        tokenRef.current = token;
        setCookie(SESSION_COOKIE, token, COOKIE_OPTIONS);

        // APIルート経由でemployee情報を取得（adminDbを使うので安定）
        const appUser = await fetchUserFromApi(token, firebaseUser.uid, false);
        setUser(appUser);
      } catch (err) {
        console.error("AuthProvider: ユーザー情報の取得に失敗", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading, refreshUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
