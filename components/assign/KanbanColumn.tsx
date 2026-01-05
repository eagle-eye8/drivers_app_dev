import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({ id, title, orders }: { id: string; title: string; orders: OrderWithCustomer[] }) {
  return (
    <div id={id} className="snap-start min-w-[280px] rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="font-bold mb-3 flex justify-between">
        {title}
        <span className="text-sm text-gray-500">{orders.length}</span>
      </h3>

      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {orders.map((order) => (
            <KanbanCard key={order.id} order={order} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
