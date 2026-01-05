import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

 export function KanbanCard({ order }: { order: OrderWithCustomer }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-xl bg-white p-3 shadow hover:shadow-md cursor-grab">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-sm">{order.customer?.name ?? "不明な顧客"}</div>
        <span className="text-xs text-gray-500">¥{order.amount.toLocaleString()}</span>
      </div>

      <div className="mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_META[order.status].badgeClass}`}>{ORDER_STATUS_META[order.status].label}</span>
      </div>
    </div>
  );
}
