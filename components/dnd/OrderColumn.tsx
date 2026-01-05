import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { OrderCard } from "./OrderCard";

export function OrderColumn({ orders }: { orders: OrderWithCustomer[] }) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
