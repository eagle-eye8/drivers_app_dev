"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SigninUser } from "@/types/signinUser";
import { doc, onSnapshot } from "firebase/firestore";

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
    // 1. Authの状態を監視
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setSigninUser(null);
          setLoading(false);
          return;
        }

        // --- STEP 1: トークンから権限(Role)を確定 ---
        const tokenResult = await firebaseUser.getIdTokenResult();
        const isAdmin = !!tokenResult.claims.admin;

        // Firebase Authの情報を元に初期ユーザーを作成（これだけで一旦アプリは動く）
        const baseUser: SigninUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
          role: isAdmin ? "admin" : "staff",
        };

        setSigninUser(baseUser);
        setLoading(false);

        // --- STEP 2: Firestoreから詳細プロファイルを同期 ---
        // getDocではなくonSnapshotを使うことで、オフラインエラーを回避しつつ
        // キャッシュがあれば即反映、オンライン復帰で自動更新される
        const docRef = doc(db, "employees", firebaseUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              const employeeData = snap.data();
              setSigninUser((prev) => (prev ? { 
                ...prev, 
                name: employeeData.name || prev.name 
              } : null));
            }
          },
          (error) => {
            // オフライン等のエラーをキャッチするが、Auth情報はあるので処理は止めない
            console.warn("Firestore profile sync error (Offline?):", error);
          }
        );

        // クリーンアップ時（ログアウト時等）にSnapshotの監視も止める
        return () => unsubscribeSnapshot();

      } catch (e) {
        console.error("Auth process error:", e);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user: signinUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
