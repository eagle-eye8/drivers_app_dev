// components/toast/ToastProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
  id: number;
  message: string;
  type?: "success" | "error";
};

type ToastContextType = {
  showToast: (message: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* --- Toast UI --- */
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded shadow text-white transition-all
            ${t.type === "error" ? "bg-red-600" : "bg-gray-900"}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
