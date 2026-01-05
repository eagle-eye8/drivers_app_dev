// components/kanban/KanbanColumn.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { OrderCard } from "@/components/dnd/OrderCard";

type Props = {
  id: string;
  title: string;
  orders: any[];
  collapsible?: boolean;
  onOrderClick?: (order: any) => void;
};

export function KanbanColumn({
  id,
  title,
  orders,
  collapsible,
  onOrderClick,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [collapsed, setCollapsed] = useState(collapsible);

  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] flex-shrink-0 rounded-xl border p-3 transition
        ${isOver ? "bg-blue-50 border-blue-400" : "bg-white"}
      `}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => collapsible && setCollapsed(!collapsed)}
          className="flex items-center gap-2 font-semibold"
        >
          {title}
          <span className="text-xs bg-gray-100 px-2 rounded-full">
            {orders.length}
          </span>
          {collapsible && (
            <span className="text-xs text-gray-400">
              {collapsed ? "▼" : "▲"}
            </span>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderClick?.(order)}
            >
              <OrderCard order={order} />
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-6">
              ここにドロップ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
