"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { KANBAN_COLUMNS } from "@/lib/kanbanColumns";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import Button from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [open, isOpen] = useState(false);
  const { data, error, isLoading } = useSWR(`/api/dashboard?date=${today}`, fetcher);
  const [collapsedCompleted, setCollapsedCompleted] = useState(true);

  if (isLoading) return <LoadingOverlay />;
  if (error || !data?.success) {
    return <div className="p-8 text-center text-gray-500">データを取得できませんでした</div>;
  }
  const todayOrders: OrderWithCustomer[] = data?.data?.todayOrders ?? [];
  const employees = data?.data?.employees ?? [];
  const customers = data?.data?.customers ?? [];
  const kpi = data?.data?.kpi ?? {
    orderCount: 0,
    pendingCount: 0,
    totalAmount: 0,
  };
  return (
    <div className="px-4 md:px-8 py-10 space-y-12 max-w-[1400px] mx-auto">
      {/* ================= KPI ================= */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi title="予約数" value={kpi.orderCount} />
        <Kpi title="未対応" value={kpi.pendingCount} danger />
        <Kpi title="スタッフ数" value={employees.length} />
        <Kpi title="売上" value={`¥${kpi.totalAmount.toLocaleString()}`} />
      </section>

      {/* ================= 注文状況 ================= */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <h2 className="text-xl font-bold">注文状況</h2>
            <Button onClick={() => isOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-1" />
              新規注文
            </Button>
            <CreateOrderModal isOpen={open} onClose={() => isOpen(false)} customers={customers} employees={employees} />
          </div>
          <Link href="/admin/orders" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
            アサインボードへ
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const orders = todayOrders?.filter((o: OrderWithCustomer) => o.status === col.id);

            if (col.id === "completed" && collapsedCompleted) {
              return (
                <div key={col.id} onClick={() => setCollapsedCompleted(false)} className="min-w-[240px] rounded-xl border bg-gray-50 p-4 cursor-pointer">
                  <h3 className="font-semibold">
                    {col.title}（{orders.length}）
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">クリックして表示</p>
                </div>
              );
            }

            return (
              <div key={col.id} className={`min-w-[260px] rounded-xl border p-4 bg-white shadow-sm ${ORDER_STATUS_META[col.id].columnClass ?? ""}`}>
                <h3 className="font-semibold mb-3 flex justify-between">
                  {col.title}
                  <span className="text-sm text-gray-500">{orders.length}</span>
                </h3>

                <div className="space-y-2">
                  {orders.map((order: OrderWithCustomer) => (
                    <div key={order.id} className="rounded-lg border p-3 hover:shadow bg-white">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">{order.customer?.name ?? "不明"}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_META[order.status].badgeClass}`}>{ORDER_STATUS_META[order.status].label}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">¥{order.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 従業員 ================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">従業員タスク</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {employees.map((emp: any) => (
            <Link key={emp.id} href={`/admin/orders/${emp.id}?date=${today}`} className="rounded-2xl bg-white border p-4 shadow hover:shadow-md">
              <div className="font-semibold">{emp.name}</div>
              <div className="text-sm text-gray-500 mt-1">担当 {emp.orderCount ?? 0} 件</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ================= KPI ================= */
function Kpi({ title, value, danger }: { title: string; value: any; danger?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow ${danger ? "bg-red-50 border border-red-200" : "bg-white"}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
