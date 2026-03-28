"use client";

import { useState } from "react";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { AssignStaffModal } from "./AssignStaffModal";
import { PickupModal } from "../pickups/PickupModal";

type Props = {
  orders: OrderWithCustomer[];
  onAssigned?: () => void; // SWR mutate 用
  onPickupCompleted?: () => void; // SWR mutate 用
};

export function AdminOrderTable({ orders, onAssigned, onPickupCompleted }: Props) {
  const [targetAssignOrder, setTargetAssignOrder] = useState<OrderWithCustomer | null>(null);
  const [targetPickupOrder, setTargetPickupOrder] = useState<OrderWithCustomer | null>(null);

  return (
    <>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr key="admin">
            <th className="px-3 py-2 text-left">注文者</th>
            <th className="px-3 py-2 text-left">住所</th>
            <th className="px-3 py-2 text-right">数量</th>
            <th className="px-3 py-2 text-center">状態</th>
            <th className="px-3 py-2 text-center">担当者</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b hover:bg-blue-50 transition cursor-pointer"
              onClick={() => setTargetPickupOrder(o)} // 行クリックで PickupModal
            >
              <td className="px-3 py-3">{o.customer?.name}</td>
              <td className="px-3 py-3">{o.customer?.address}</td>
              <td className="px-3 py-3 text-right">{o.items?.reduce((sum, i) => sum + i.quantity, 0)}</td>

              {/* 状態 */}
              <td className="px-3 py-3 text-center">
                <span className={`inline-block text-xs px-2 py-1 rounded ${ORDER_STATUS_META[o.status]?.badgeClass}`}>{ORDER_STATUS_META[o.status]?.label}</span>
              </td>

              {/* 担当者 */}
              <td className="px-3 py-3 text-center">
                {o.assignedEmployee?.name ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 行クリックを阻止
                      setTargetAssignOrder(o);
                    }}
                    className="inline-flex justify-center text-blue-600 hover:underline"
                  >
                    {o.assignedEmployee.name}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetAssignOrder(o);
                    }}
                    className="inline-flex justify-center text-xs px-3 py-1 border rounded-full hover:bg-gray-100"
                  >
                    ＋ 割り当て
                  </button>
                )}
              </td>

              {/* Map */}
              <td className="px-3 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const { lat, lng } = o.customer!.location!;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, "_blank");
                  }}
                  className="rounded-full border px-3 py-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  📍 Map
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Assign Staff Modal ===== */}
      {targetAssignOrder && (
        <AssignStaffModal
          orderId={targetAssignOrder.id}
          assignedEmployee={targetAssignOrder.assignedEmployee}
          onClose={() => setTargetAssignOrder(null)}
          onAssigned={() => {
            setTargetAssignOrder(null);
            onAssigned?.(); // SWR mutate
          }}
        />
      )}

      {/* ===== Pickup Modal ===== */}
      {targetPickupOrder && (
        <PickupModal
          order={targetPickupOrder}
          onClose={() => setTargetPickupOrder(null)}
          onSuccess={() => {
            setTargetPickupOrder(null);
            onPickupCompleted?.(); // SWR mutate
          }}
        />
      )}
    </>
  );
}
