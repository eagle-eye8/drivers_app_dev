"use client";

import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { MapPin, NotebookPen, Package, UserPlus } from "lucide-react"; // アイコンを使うとよりリッチになります
import { useState } from "react";
import { PickupModal } from "../PickupModal";
import { useSnackbar } from "../ui/SnackbarProvider";
import { AssignStaffModal } from "./AssignStaffModal";

type Props = {
  orders: OrderWithCustomer[];
  onAssigned?: () => void;
  onPickupCompleted?: () => void;
};

export function AdminOrderTable({ orders, onAssigned, onPickupCompleted }: Props) {
  const [targetAssignOrder, setTargetAssignOrder] = useState<OrderWithCustomer | null>(null);
  const [targetPickupOrder, setTargetPickupOrder] = useState<OrderWithCustomer | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleOpenMap = (e: React.MouseEvent, order: OrderWithCustomer) => {
    e.stopPropagation();
    const customer = order.customer;
    if (!customer?.address) {
      showSnackbar("住所情報がありません。", "error");
      return;
    }

    let url = "";
    if (customer.location?.lat && customer.location?.lng) {
      // 座標がある場合
      url = `https://www.google.com/maps/dir/?api=1&destination=${customer.location.lat},${customer.location.lng}&travelmode=driving`;
    } else {
      // 座標がない場合は住所文字列で検索
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">注文者</th>
              <th className="px-4 py-3">住所</th>
              <th className="px-4 py-3 text-right">数量</th>
              <th className="px-4 py-3 text-center">ステータス</th>
              <th className="px-4 py-3 text-center">担当者</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => setTargetPickupOrder(o)}>
                <td className="px-4 py-4 font-medium text-gray-900">{o.customer?.name}</td>
                <td className="px-4 py-4">
                  <button onClick={(e) => handleOpenMap(e, o)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors group">
                    <MapPin size={14} className="shrink-0 group-hover:bounce" />
                    <span className="truncate max-w-[200px] border-b border-transparent group-hover:border-blue-800 text-[13px]">{o.customer?.address || "住所不明"}</span>
                  </button>
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-600">{o.items?.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${ORDER_STATUS_META[o.status]?.badgeClass}`}>{ORDER_STATUS_META[o.status]?.label}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetAssignOrder(o);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${o.assignedEmployee?.name ? "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200" : "text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200"}`}
                  >
                    {o.assignedEmployee?.name ? (
                      o.assignedEmployee.name
                    ) : (
                      <>
                        <UserPlus size={14} /> 割り当て
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} onClick={() => setTargetPickupOrder(o)} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{o.customer?.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ORDER_STATUS_META[o.status]?.badgeClass}`}>{ORDER_STATUS_META[o.status]?.label}</span>
            </div>

            <button onClick={(e) => handleOpenMap(e, o)} className="flex items-start gap-1.5 text-blue-600 mb-1 w-full text-left">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span className="text-[12px] leading-tight flex-1 underline decoration-blue-300">{o.customer?.address || "住所不明"}</span>
            </button>

            <div className="flex justify-between items-center pt-1 border-t border-gray-50">
              {o.status === "completed" ? (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Package size={14} />
                  <span>{o.items?.reduce((sum, i) => sum + i.quantity, 0)} 個</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <NotebookPen size={14} />
                  <span>{o.notes}</span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetAssignOrder(o);
                }}
                className="text-[11px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                {o.assignedEmployee?.name || "担当者振分"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {targetAssignOrder && (
        <AssignStaffModal
          orderId={targetAssignOrder.id}
          assignedEmployee={targetAssignOrder.assignedEmployee}
          onClose={() => setTargetAssignOrder(null)}
          onAssigned={() => {
            setTargetAssignOrder(null);
            onAssigned?.();
          }}
        />
      )}
      {targetPickupOrder && (
        <PickupModal
          order={targetPickupOrder}
          onClose={() => setTargetPickupOrder(null)}
          onSuccess={() => {
            setTargetPickupOrder(null);
            onPickupCompleted?.();
          }}
        />
      )}
    </div>
  );
}
