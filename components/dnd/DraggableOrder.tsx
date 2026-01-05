import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { OrderCard } from "./OrderCard";

export function DraggableOrder({ order }: { order: OrderWithCustomer }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: {
      assignedUid: order.assignedUid ?? null,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <OrderCard order={order} />
    </div>
  );
}
