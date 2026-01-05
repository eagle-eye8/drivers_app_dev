// components/toast/useToast.ts
"use client";

import { useToastContext } from "./ToastProvider";

export function useToast() {
  return useToastContext();
}
