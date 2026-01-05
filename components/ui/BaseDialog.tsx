"use client";

import { ReactNode } from "react";

export type BaseDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;

  // 保存系 Dialog 用（任意）
  onSave?: () => void | Promise<void>;
  saving?: boolean;
};

export function BaseDialog({ open, onClose, title, children, onSave, saving }: BaseDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded" disabled={saving}>
            キャンセル
          </button>

          {onSave && (
            <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
              {saving ? "保存中…" : "保存"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
