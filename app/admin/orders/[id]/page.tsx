"use client";

import { useState } from "react";
import useSWR from "swr";

import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { fetcher } from "@/lib/fetcher";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { DateSelector } from "@/components/date/DateSelector";

export default function OrdersPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useSWR<{
    success: boolean;
    data: OrderWithCustomer[];
  }>(`/api/orders?date=${selectedDate}`, fetcher);

  return (
    <div className="p-6 space-y-6">
      {/* ===== ヘッダー ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">注文一覧</h1>
      </div>

      {/* ===== 日付切替 ===== */}
      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      {/* ===== ローディング ===== */}
      {isLoading && <div>Loading...</div>}

      {/* ===== 一覧 ===== */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">顧客</th>
              <th className="px-4 py-2">ステータス</th>
              <th className="px-4 py-2">金額</th>
              <th className="px-4 py-2">担当</th>
              <th className="px-4 py-2">備考</th>
            </tr>
          </thead>

          <tbody>
            {data?.data.map((order) => {
              const meta = ORDER_STATUS_META[order.status];

              return (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{order.customer?.name}</div>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${meta.badgeClass}`}>{meta.label}</span>
                  </td>

                  <td className="px-4 py-2 text-right">¥{order.amount.toLocaleString()}</td>

                  <td className="px-4 py-2 text-center">{order.assignedUid ?? "未割り当て"}</td>

                  <td className="px-4 py-2 text-gray-500">{order.notes || "-"}</td>
                </tr>
              );
            })}

            {data?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  注文がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
