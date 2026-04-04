"use client";

import { AdminOrderTable } from "@/components/orders/AdminOrderTable";
import { DateNavigator } from "@/components/orders/DateNavigator"; // タイポ修正
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { PackageCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminOrdersPage() {
  const [date, setDate] = useState(getJstDateString());
  const { data: res, mutate, isLoading } = useSWR(`/api/orders?date=${date}`, fetcher);
  const { activeOrders, completedOrders } = useMemo(() => {
    const allOrders: OrderWithCustomer[] = res?.success ? res.data : [];
    return {
      activeOrders: allOrders.filter((o) => o.status !== "completed"),
      completedOrders: allOrders.filter((o) => o.status === "completed"),
    };
  }, [res]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <DateNavigator date={date} onChange={setDate} />

      {/* 配達予定 */}
      <section>
        <h2 className="flex items-center gap-x-3 text-lg font-bold mb-4 text-slate-800">
          <div className="bg-blue-100 p-2 rounded-xl border border-blue-200">
            <Truck className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          </div>
          <span>配達予定</span>
        </h2>
        <AdminOrderTable orders={activeOrders} onAssigned={() => mutate()} />
      </section>

      {/* 完了 */}
      <section className="pt-6 border-t">
        <h2 className="flex items-center gap-x-3 text-lg font-bold mb-4 text-slate-500">
          <div className="bg-emerald-100 p-2 rounded-xl border border-emerald-200">
            <PackageCheck className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <span>完了</span>
        </h2>
        <div className="pointer-events-none opacity-60 select-none grayscale-[0.5]">
          <AdminOrderTable orders={completedOrders} />
        </div>
      </section>
      {isLoading && <LoadingOverlay text="集荷データ取得中..." />}
    </div>
  );
}
