"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SigninUser } from "@/types/signinUser";
import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: SigninUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [signinUser, setSigninUser] = useState<SigninUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged の中で最新の firebaseUser を受け取るため、
    // コンポーネントトップレベルでの auth.currentUser 参照は不要です。
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setSigninUser(null);
          setLoading(false);
          return;
        }

        // ⚡️ STEP 1: カスタムクレームから権限を取得
        const tokenResult = await firebaseUser.getIdTokenResult();
        const isAdmin = !!tokenResult.claims.admin;

        // 初期表示用のユーザーオブジェクトを作成
        // name が null の可能性があるため、空文字かメールアドレスをフォールバックに使う
        const baseUser: SigninUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "Unknown User",
          role: isAdmin ? "admin" : "staff",
        };

        setSigninUser(baseUser);
        setLoading(false); // 🚀 STEP 1完了時点で表示を許可

        // ⚡️ STEP 2: Firestore から詳細情報（正しい表示名など）をバックグラウンドで取得
        const snap = await getDoc(doc(db, "employees", firebaseUser.uid));
        if (snap.exists()) {
          const employeeData = snap.data();
          setSigninUser((prev) => (prev ? { 
            ...prev, 
            name: employeeData.name || prev.name 
          } : null));
        }
      } catch (e) {
        console.error("Auth process error:", e);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Contextに渡す値を signinUser に修正
  return (
    <AuthContext.Provider value={{ user: signinUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
