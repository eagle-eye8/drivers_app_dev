"use client";

import { useState } from "react";

export function useDialog<T>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  return {
    isOpen,
    data,
    open: (value: T) => {
      setData(value);
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      setData(null);
    },
  };
}
