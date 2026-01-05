import { SortableContext } from "@dnd-kit/sortable";
import { OrderCard } from "../dnd/OrderCard";

export default function UnassignedOrders({ orders }: any) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">
        未アサイン注文（{orders.length}）
      </h2>

      <SortableContext items={orders.map((o: any) => o.id)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((o: any) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
