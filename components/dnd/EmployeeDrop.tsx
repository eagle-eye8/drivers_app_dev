// components/dnd/EmployeeDrop.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableOrder } from "./DraggableOrder";
import { OrderWithCustomer } from "@/types/orderWithCustomer";

type Props = {
  employee: {
    id: string;
    name: string;
  };
  orders: OrderWithCustomer[];
};

export function EmployeeDrop({ employee, orders }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: employee.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl border p-4 min-h-[140px] transition
        ${isOver ? "bg-blue-100 border-blue-500" : "bg-white"}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">{employee.name}</div>
        <div className="text-xs text-gray-500">担当 {orders.length} 件</div>
      </div>

      {/* Orders */}
      <div className="space-y-2">
        {orders.map((order) => (
          <DraggableOrder key={order.id} order={order} />
        ))}

        {orders.length === 0 && <div className="text-xs text-gray-400">担当なし</div>}
      </div>
    </div>
  );
}
