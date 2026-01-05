"use client";

import { createContext, useContext, useState, ReactNode, useRef, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

type SnackbarType = "success" | "error" | "warning" | "info";

type SnackbarState = {
  message: string;
  type: SnackbarType;
};

const SnackbarContext = createContext<{
  showSnackbar: (message: string, type: SnackbarType) => void;
} | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSnackbar = useCallback((message: string, type: SnackbarType = "info") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSnackbar({ message, type });

    timeoutRef.current = setTimeout(() => {
      setSnackbar(null);
      timeoutRef.current = null;
    }, 3000);
  }, []);
  const bgClass = snackbar
    ? {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-amber-500",
        info: "bg-slate-700",
      }[snackbar.type]
    : "";
  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {snackbar && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${bgClass}`}>
            {snackbar.type === "success" && <CheckCircle />}
            {snackbar.type === "error" && <XCircle />}
            {snackbar.type === "warning" && <AlertTriangle />}
            {snackbar.type === "info" && <Info />}
            <span className="font-medium">{snackbar.message}</span>
            <button onClick={() => setSnackbar(null)} className="ml-2 opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}
