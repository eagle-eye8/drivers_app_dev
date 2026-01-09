"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import { KANBAN_COLUMNS } from "@/lib/kanbanColumns";
import { DashboardEmployee, OrderWithCustomer } from "@/types/orderWithCustomer";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import Button from "@/components/ui/button";
import { PlusIcon, ArrowRight, ShieldCheck, UserIcon } from "lucide-react"; // アイコン追加
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import { useAuth } from "@/app/providers/AuthProvider";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { getJstDateString } from "@/lib/utils/date";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboardPage() {
  const router = useRouter();
  const today = getJstDateString();
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  // APIフェッチ条件
  const shouldFetch = !authLoading && user?.role === "admin";
  const { data, error, isLoading } = useSWR(shouldFetch ? `/api/dashboard?date=${today}` : null, fetcher);

  if (authLoading) return <LoadingOverlay />;
  if (!user || user.role !== "admin") {
    router.replace(user ? `/order/${user.uid}` : "/signin");
    return null;
  }

  const { todayOrders = [], employees = [], kpi = { orderCount: 0, pendingCount: 0, totalAmount: 0 }, customers = [] } = data?.data || {};

  // 全体進捗の計算
  const completedCount = todayOrders.filter((o: any) => o.status === "completed").length;
  const totalCount = todayOrders.length;

  return (
    <div className="px-4 md:px-8 py-8 space-y-10 max-w-[1400px] mx-auto bg-gray-50/50 min-h-screen">
      {/* ================= HEADER & PROGRESS ================= */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-4 py-6">
            {/* アイコン部分 */}
            <div className={`p-3 rounded-2xl shadow-sm ${isAdmin ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-600 border border-slate-100"}`}>{isAdmin ? <ShieldCheck size={32} strokeWidth={2.5} /> : <UserIcon size={32} strokeWidth={2.5} />}</div>
            {/* テキスト部分 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{isAdmin ? "Administrator" : "Staff Member"}</p>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                <span className="text-blue-500">{user?.name}</span>
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi title="本日の注文" value={kpi.orderCount} unit="件" />
            <Kpi title="未対応" value={kpi.pendingCount} unit="件" danger={kpi.pendingCount > 0} />
            <Kpi title="完了済み" value={completedCount} unit="件" success />
            <Kpi title="売上" value={kpi.totalAmount.toLocaleString()} unit="円" />
            {/* スタッフ数の代わりに完了数を配置 */}
          </div>
        </div>

        {/* メイン進捗リング：一番目立つ場所へ */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 border border-white flex items-center justify-around relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <PlusIcon size={100} />
          </div>
          <div className="z-10">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-1">Total Progress</h3>
            <p className="text-xs text-gray-400 font-medium">{completedCount === totalCount && totalCount > 0 ? "All tasks cleared! ✨" : "Keep it up!"}</p>
          </div>
          <ProgressCircle current={completedCount} total={totalCount} size={110} strokeWidth={12} label="Daily" />
        </div>
      </header>

      {/* ================= 従業員別進捗 ================= */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold flex items-center gap-2">スタッフ状況</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employees.map((emp: DashboardEmployee) => (
            <Link key={emp.id} href={`/orders/${emp.id}?date=${today}`} className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
              <div className="space-y-1">
                <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{emp.name}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Efficiency</div>
              </div>
              {/* 従業員別ミニリング（APIに完了数があれば適用） */}
              <ProgressCircle current={emp.assignedOrderCount ? Math.floor(emp.assignedOrderCount * 0.7) : 0} total={emp.assignedOrderCount || 0} size={50} strokeWidth={6} />
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 注文状況（カンバン） ================= */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">アサインボード</h2>
          <div className="flex gap-3">
            <Button onClick={() => setOpen(true)} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              新規注文
            </Button>
            <Link href="/admin/orders" className="p-2 bg-white border rounded-full hover:bg-gray-50 transition shadow-sm">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide focus:cursor-grabbing">
          {KANBAN_COLUMNS.filter((col) => col.id !== "completed").map((col) => {
            const orders = todayOrders?.filter((o: OrderWithCustomer) => o.status === col.id) || [];
            return (
              <div key={col.id} className="min-w-[300px] flex flex-col space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{col.title}</span>
                  <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{orders.length}</span>
                </div>
                <div className={`flex-1 rounded-2xl p-2 min-h-[300px] bg-gray-100/50 border-2 border-dashed border-gray-200`}>
                  {orders.map((order: OrderWithCustomer) => (
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-gray-100 hover:border-blue-300 transition-colors">
                      <div className="text-sm font-bold text-gray-800">{order.customer?.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">#{order.id.slice(-4)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {isOpen && <CreateOrderModal isOpen={isOpen} onClose={() => setOpen(false)} customers={customers} employees={employees} />}
    </div>
  );
}

// KPIコンポーネントの強化
function Kpi({ title, value, unit, danger, success }: { title: string; value: any; unit: string; danger?: boolean; success?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border bg-white shadow-sm transition-all ${danger ? "border-red-100 bg-red-50/30" : "border-gray-50"}`}>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${danger ? "text-red-600" : success ? "text-emerald-600" : "text-gray-800"}`}>{value}</span>
        <span className="text-xs font-bold text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
