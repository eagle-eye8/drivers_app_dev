// components/orders/OrdersList.tsx
"use client";

import { Order } from "@/types/order";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { OrderWithCustomer } from "@/types/orderWithCustomer";

export function OrdersList({ orders, onClick }: { orders: OrderWithCustomer[]; onClick: (order: Order) => void }) {
  if (orders?.length === 0) {
    return <div className="text-sm text-gray-500">注文がありません</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders?.map((o: OrderWithCustomer) => (
        <div key={o.id} onClick={() => onClick(o)} className="cursor-pointer rounded-xl border bg-white p-4 shadow hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">{o.customer?.name ?? "不明な顧客"}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_META[o.status].badgeClass}`}>{ORDER_STATUS_META[o.status].label}</span>
          </div>

          <div className="text-sm text-gray-600">¥{o.amount.toLocaleString()}</div>

          {o.assignedUid && <div className="text-xs text-gray-400 mt-1">担当: {o.assignedUid}</div>}
        </div>
      ))}
    </div>
  );
}
