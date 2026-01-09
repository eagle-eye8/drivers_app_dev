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
  const [user, setUser] = useState<SigninUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // ⚡️ STEP 1: 【最速】カスタムクレームだけで「権限」を確定させる
      const tokenResult = await firebaseUser.getIdTokenResult();
      const isAdmin = !!tokenResult.claims.admin;

      // この時点で一旦、最低限の情報をセットして「loading」を解除する
      // これにより、ダッシュボードのガードを即座にパスできる
      const baseUser: SigninUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: isAdmin ? "管理者" : firebaseUser.displayName || "読み込み中...",
        role: isAdmin ? "admin" : "staff",
      };

      setUser(baseUser);
      setLoading(false); // 🚀 ここで画面表示を許可！

      // ⚡️ STEP 2: 【遅延】Firestoreから追加の詳細情報を取得（バックグラウンド）
      // これが遅くても、画面はすでに表示されているのでユーザーは待たされない
      try {
        const snap = await getDoc(doc(db, "employees", firebaseUser.uid));
        if (snap.exists()) {
          const employeeData = snap.data();
          setUser((prev) => (prev ? { ...prev, name: employeeData.name } : null));
        }
      } catch (e) {
        console.warn("Firestore data fetch failed in background", e);
        // 管理者ならFirestoreが失敗しても何の問題もない
      }
    });

    return () => unsubscribe();
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
