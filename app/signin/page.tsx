import { Suspense } from "react";
import SignInClient from "./SignInClient";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function Signin() {
  return (
    <Suspense fallback={<LoadingOverlay text="読み込み中…" />}>
      <SignInClient />
    </Suspense>
  );
}
