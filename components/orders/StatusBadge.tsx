// components/orders/StatusBadge.tsx
"use client";

import { ORDER_STATUS_META, OrderStatus } from "@/lib/orderStatus";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badgeClass}`}
    >
      {meta.label}
    </span>
  );
}
