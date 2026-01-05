"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

type SnackbarType = "success" | "error" | "info";

type SnackbarState = {
  message: string;
  type: SnackbarType;
};

const SnackbarContext = createContext<{
  showSnackbar: (message: string, type: SnackbarType) => void;
} | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar(null), 3000);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {snackbar && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white
              ${snackbar.type === "success" && "bg-green-500"}
              ${snackbar.type === "error" && "bg-red-500"}
              ${snackbar.type === "info" && "bg-slate-700"}
            `}
          >
            {snackbar.type === "success" && <CheckCircle />}
            {snackbar.type === "error" && <XCircle />}
            {snackbar.type === "info" && <Info />}
            <span className="font-medium">{snackbar.message}</span>
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
