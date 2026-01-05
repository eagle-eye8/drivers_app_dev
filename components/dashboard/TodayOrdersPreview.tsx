// components/dashboard/TodayOrdersPreview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export function TodayOrdersPreview({ orders }: any) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className="border rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">本日の注文</h2>
        <Link href="/admin/orders" className="text-sm text-blue-600">
          一覧へ
        </Link>
      </div>

      <div className="space-y-2">
        {orders.slice(0, 5).map((o: any) => (
          <div
            key={o.id}
            onClick={() => setSelected(o)}
            className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="font-semibold">{o.customer?.name ?? "不明"}</div>
            <div className="text-xs text-gray-500">
              ¥{(o.amount || 0).toLocaleString()}
              {!o.assignedUid && (
                <span className="ml-2 text-red-600">未割り当て</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
