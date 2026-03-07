"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardEmployee, OrderWithCustomer } from "@/types/orderWithCustomer";
import { PlusIcon, UserIcon, FileUser, ListPlus } from "lucide-react";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import { useAuth } from "@/app/providers/AuthProvider";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { getJstDateString } from "@/lib/utils/date";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";
import DailySummaryModal from "@/components/ui/DailySummaryModal";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboard() {
  const router = useRouter();
  const today = getJstDateString();
  const { user, loading: authLoading } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const shouldFetch = isAdmin;

  const { data, isLoading, error } = useSWR(shouldFetch ? `/api/dashboard?date=${today}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // ダッシュボードなら1分くらいキャッシュしてOK
    fallbackData: { success: false, data: { todayOrders: [], employees: [], kpi: { orderCount: 0, pendingCount: 0, totalAmount: 0 }, customers: [] } },
  });

  if (error) return <div className="p-10 text-red-500">エラー: {error}</div>;
  if (!data) return <div className="p-10 text-gray-500">データがありません</div>;

  const { todayOrders = [], employees = [], kpi = { orderCount: 0, pendingCount: 0, totalAmount: 0 }, customers = [] } = data.data;

  const progressStats = useMemo(() => {
    const completed = todayOrders.filter((o: OrderWithCustomer) => o.status === "completed").length;
    const total = todayOrders.length;
    return { completed, total };
  }, [todayOrders]);

  if (isLoading) {
    return <LoadingOverlay text="データを読み込み中..." />;
  }

  return (
    <div className="px-4 md:px-8 py-8 space-y-10 max-w-[1400px] mx-auto bg-gray-50/50 min-h-screen">
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi title="本日の注文" value={kpi.orderCount} unit="件" />
            <Kpi title="完了済み" value={progressStats.completed} unit="件" success />
            <Kpi title="売上" value={kpi.totalAmount.toLocaleString()} unit="円" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 border border-white flex items-center justify-around relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <PlusIcon size={100} />
          </div>
          <div className="z-10">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-1">進捗状況</h3>
            <p className="text-xs text-gray-400 font-medium">{progressStats.completed === progressStats.total && progressStats.total > 0 ? "集荷完了! ✨" : "集荷実施中!"}</p>
          </div>
          <ProgressCircle current={progressStats.completed} total={progressStats.total} size={110} strokeWidth={12} />
        </div>
      </header>

      {/* スタッフ状況セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">スタッフ状況</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employees.map((emp: DashboardEmployee) => (
            <Link key={emp.id} href={`/orders/${emp.id}?date=${today}`} prefetch={false} className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
              <div className="space-y-1">
                <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{emp.name}</div>
              </div>
              <ProgressCircle current={emp.completedOrderCount} total={emp.assignedOrderCount || 0} size={50} strokeWidth={6} />
            </Link>
          ))}
        </div>
      </section>

      {/* FABとモーダル類（省略なし） */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[-1]" onClick={() => setIsMenuOpen(false)} />}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          <button
            onClick={() => {
              setIsCustomerModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 hover:bg-emerald-50 text-emerald-700 transition-all active:scale-95"
          >
            <span className="text-sm font-bold">新規顧客登録</span>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <UserIcon className="w-5 h-5" />
            </div>
          </button>
          <button
            onClick={() => {
              setIsOrderModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 hover:bg-blue-50 text-blue-700 transition-all active:scale-95"
          >
            <span className="text-sm font-bold">新規注文作成</span>
            <div className="p-2 bg-blue-100 rounded-xl">
              <ListPlus className="w-5 h-5" />
            </div>
          </button>
          <button
            onClick={() => {
              setIsSummaryOpen(true);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 hover:bg-blue-50 text-blue-700 transition-all active:scale-95"
          >
            <span className="text-sm font-bold">集計サマリー</span>
            <div className="p-2 bg-blue-100 rounded-xl">
              <FileUser className="w-5 h-5" />
            </div>
          </button>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isMenuOpen ? "bg-slate-800 rotate-45 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>

      {isOrderModalOpen && <CreateOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} customers={customers} employees={employees} />}
      {isCustomerModalOpen && <CreateCustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} />}
      {isSummaryOpen && <DailySummaryModal onClose={() => setIsSummaryOpen(false)} isAdmin={isAdmin} uid={user?.uid} orders={todayOrders} />}
    </div>
  );
}

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
