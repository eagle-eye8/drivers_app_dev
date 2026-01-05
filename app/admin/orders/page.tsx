"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { AdminOrderTable } from "@/components/orders/AdminOrderTable";
import { DateNavigator } from "@/components/orders/DateNavigater";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminOrdersPage() {
  const [date, setDate] = useState(getJstDateString());
  const { data: res, mutate } = useSWR(`/api/orders?date=${date}`, fetcher);
  const [open, setOpen] = useState(false);

  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);

  useEffect(() => {
    if (res?.success) setOrders(res.data);
  }, [res]);

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const oldIndex = activeOrders.findIndex((o) => o.id === active.id);
    const newIndex = activeOrders.findIndex((o) => o.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activeOrders, oldIndex, newIndex).map((o, i) => ({
      ...o,
      deliveryOrder: i,
    }));

    // state 即反映
    setOrders([...reordered, ...completedOrders]);

    // 永続化
    await fetch("/api/orders/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        reordered.map((o) => ({
          id: o.id,
          deliveryOrder: o.deliveryOrder,
        }))
      ),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <DateNavigator date={date} onChange={setDate} />

      {/* ===== 未完了 ===== */}
      <DndContext onDragEnd={handleDragEnd}>
        <section>
          <h2 className="text-lg font-semibold mb-3">🚚 配達予定</h2>
          <AdminOrderTable orders={activeOrders} onAssigned={() => mutate()} />
        </section>
      </DndContext>

      {/* ===== 完了 ===== */}
      <section className="pt-6 border-t">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">完了</h2>
        <AdminOrderTable orders={completedOrders} />
      </section>
    </div>
  );
}
