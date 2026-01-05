// components/ui/Dialog.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function AppDialog({
  open,
  onOpenChange,
  title,
  children,
}: any) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          className="
            fixed top-1/2 left-1/2 w-full max-w-2xl
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-2xl p-6 shadow-lg
          "
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
