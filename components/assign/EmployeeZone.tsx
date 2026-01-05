import { useDroppable } from "@dnd-kit/core";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { OrderCard } from "../dnd/OrderCard";

export function EmployeeZone({
  emp,
  orders,
}: {
  emp: any;
  orders: OrderWithCustomer[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `emp-${emp.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl border p-4 min-h-[140px]
        ${isOver ? "bg-blue-50 border-blue-400" : "bg-white shadow-sm"}
      `}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{emp.name}</h3>
        <span className="text-xs text-gray-500">
          {orders.length} 件
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}

        {orders.length === 0 && (
          <div className="text-xs text-gray-400">ここにドロップ</div>
        )}
      </div>
    </div>
  );
}
