"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, rectIntersection } from "@dnd-kit/core";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { EmployeeDrop } from "@/components/dnd/EmployeeDrop";
import { DraggableOrder } from "@/components/dnd/DraggableOrder";
import { UnassignedDrop } from "@/components/dnd/UnassignedDrop";
import { Employee } from "@/types/employee";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AssignBoardPage() {
  /* ================= Data ================= */
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);
  const [collapsedCompleted, setCollapsedCompleted] = useState(true);

  /* ================= DnD ================= */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);

  useEffect(() => {
    if (data?.success) {
      setOrders(data.data.todayOrders);
    }
  }, [data]);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!data?.success) return <div className="p-8">Error</div>;

  const { employees } = data.data;

  const unassignedOrders = orders.filter((o) => o.assignedUid == null);

  /* ================= Drag End ================= */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const dropId = over.id as string;

    const prevOrders = orders;

    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    let nextAssignedUid: string | null = null;

    if (dropId === "unassigned") {
      nextAssignedUid = null;
    } else {
      nextAssignedUid = dropId; // employee.id
    }
    if (target.assignedUid === nextAssignedUid) return;
    // ✅ 即UI更新
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, assignedUid: nextAssignedUid } : o)));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedUid: nextAssignedUid }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // 🔙 rollback
      setOrders(prevOrders);
    }
  };

  const ordersByEmployee = (uid: string) => orders.filter((o) => o.assignedUid === uid);
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* ================= Header ================= */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">アサインボード</h1>

        {unassignedOrders.length > 0 && <span className="text-sm bg-red-600 text-white px-3 py-1 rounded-full">未対応 {unassignedOrders.length} 件</span>}
      </header>
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">注文状況</h2>

          <Link
            href="/admin/orders"
            className="
                inline-flex items-center gap-2
                text-sm font-medium text-white
                bg-gradient-to-r from-blue-600 to-indigo-600
                px-4 py-2 rounded-full shadow
                hover:opacity-90 transition
              "
          >
            注文一覧へ →
          </Link>
        </div>
      </section>
      <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
        {/* ================= Kanban ================= */}
        <UnassignedDrop>
          {unassignedOrders.map((order) => (
            <DraggableOrder key={order.id} order={order} />
          ))}
        </UnassignedDrop>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {employees.map((emp: Employee) => (
            <EmployeeDrop key={emp.id} employee={emp} orders={ordersByEmployee(emp.id)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
