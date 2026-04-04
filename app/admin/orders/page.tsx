"use client";

import { AdminOrderTable } from "@/components/orders/AdminOrderTable";
import { DateNavigator } from "@/components/orders/DateNavigator";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { PackageCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminOrdersPage() {
  const [date, setDate] = useState(getJstDateString());
  const { data: res, mutate } = useSWR(`/api/orders?date=${date}`, fetcher);

  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);

  useEffect(() => {
    if (res?.success) setOrders(res.data);
  }, [res]);

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <DateNavigator date={date} onChange={setDate} />
      <section>
        <h2 className="flex items-center gap-x-3 text-lg font-semibold mb-3">
          <Truck className="w-7 h-7 text-blue-500 fill-blue-100" strokeWidth={1.5} />
          <span>配達予定</span>
        </h2>
        <AdminOrderTable orders={activeOrders} onAssigned={() => mutate()} />
      </section>
      <section className="pt-6 border-t">
        <h2 className="flex items-center gap-x-3 text-lg font-semibold text-gray-500 mb-2">
          <PackageCheck className="w-7 h-7 text-emerald-500 fill-emerald-100" />
          <span>完了</span>
        </h2>
        <div className="pointer-events-none opacity-60 select-none">
          <AdminOrderTable orders={completedOrders} />
        </div>
      </section>
    </div>
  );
}
