// components/orders/StatusFilter.tsx
"use client";

import { ORDER_STATUS_META, OrderStatus } from "@/lib/orderStatus";

export function StatusFilter({
  value,
  onChange,
}: {
  value: OrderStatus | "all";
  onChange: (v: OrderStatus | "all") => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(["all", ...Object.keys(ORDER_STATUS_META)] as (OrderStatus | "all")[]).map(
        (s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-3 py-1 rounded-full text-sm border transition
              ${
                value === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50"
              }`}
          >
            {s === "all" ? "すべて" : ORDER_STATUS_META[s].label}
          </button>
        )
      )}
    </div>
  );
}
