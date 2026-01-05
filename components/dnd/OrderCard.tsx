import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { OrderWithCustomer } from "@/types/orderWithCustomer";

export function OrderCard({ order }: { order: OrderWithCustomer }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id, // ← orderId
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-lg border bg-white p-3 cursor-grab active:cursor-grabbing">
      <div className="font-medium text-sm">{order.customer?.name ?? "不明な顧客"}</div>
      <div className="text-xs text-gray-500">¥{order.amount.toLocaleString()}</div>
    </div>
  );
}
