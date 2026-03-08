"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: "admin" | "driver";
};

// useSearchParams を使っていないので AuthGuard 自体は Suspense 不要。
// ただし children の中で useSearchParams を使うコンポーネントがある場合は
// そちら側で Suspense を設定すること。

function AuthGuardInner({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasRedirected.current) return;

    if (!user) {
      hasRedirected.current = true;
      router.replace("/signin");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      hasRedirected.current = true;
      router.replace(user.role === "admin" ? "/admin/dashboard" : `/orders/${user.uid}`);
      return;
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}

export default function AuthGuard(props: AuthGuardProps) {
  return (
    <Suspense fallback={null}>
      <AuthGuardInner {...props} />
    </Suspense>
  );
}
