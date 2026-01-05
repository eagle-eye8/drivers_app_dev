"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl px-8 py-6 shadow-2xl text-center">
        <Loader2 className="w-12 h-12 mx-auto text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-200 font-medium">{text ?? "処理中です..."}</p>
      </div>
    </div>
  );
}
