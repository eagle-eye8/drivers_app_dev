"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string | null | undefined;
  size?: number;
}

export function CopyButton({ value, size = 12 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg transition-all shrink-0 ${
        copied
          ? "bg-emerald-100 text-emerald-600 scale-110"
          : "bg-gray-100 text-gray-400 active:bg-gray-200"
      }`}
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
