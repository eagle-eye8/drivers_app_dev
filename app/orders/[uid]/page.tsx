"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import OrderCard from "@/components/orders/OrderCard";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Loader2, LogOut, Package, PlusIcon, Route, Star, TrendingUp, Truck, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

const PickupModal = dynamic(
  () =>
    import("@/components/pickups/PickupModal").then((m) => ({
      default: m.PickupModal,
    })),
  { ssr: false },
);
const DailySummaryModal = dynamic(() => import("@/components/ui/DailySummaryModal"), { ssr: false });
const ClosingDayModal = dynamic(() => import("@/components/ClosingDayModal"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const EMPTY_DATA = { data: [] };

export default function IndividualOrdersPage() {
  const { user } = useAuth();
  const { uid } = useParams() as { uid: string };
  const today = getJstDateString();

  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isClosingDayOpen, setIsClosingDayOpen] = useState(false);

  useEffect(() => {
    const preload = () => {
      import("@/components/pickups/PickupModal");
      import("@/components/ui/DailySummaryModal");
      import("@/components/ClosingDayModal");
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 300);
    }
  }, []);

  const { data, isLoading, mutate } = useSWR(uid ? `/api/orders?date=${today}&uid=${uid}` : null, fetcher, {
    fallbackData: EMPTY_DATA,
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const orders: OrderWithCustomer[] = data?.data ?? [];
  const incompleteOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const totalItems = orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) ?? 0), 0);

  const isAnyModalOpen = isClosingDayOpen || isSummaryOpen || !!selectedOrder;

  const handleBatchRoute = useCallback(() => {
    if (incompleteOrders.length === 0) return;
    const dest = incompleteOrders[incompleteOrders.length - 1];
    const destination = encodeURIComponent(dest.customer?.address ?? "");
    const waypoints = incompleteOrders
      .slice(0, -1)
      .map((o) => encodeURIComponent(o.customer?.address ?? ""))
      .join("|");
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("現在地")}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`, "_blank");
  }, [incompleteOrders]);

  const handlePickupSuccess = useCallback(() => {
    mutate();
    setSelectedOrder(null);
  }, [mutate]);

  if (isLoading && orders.length === 0) {
    return <LoadingOverlay text="データを読み込み中..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 py-7 rounded-b-[3.5rem] shadow-xl sticky top-0 z-20 border-b border-slate-100">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">集荷サマリー</h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm shrink-0">
                <TrendingUp size={12} className="text-emerald-600" />
                <span className="text-xs font-black text-emerald-700">¥{totalSales.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm shrink-0">
                <Package size={12} className="text-blue-500" />
                <span className="text-xs font-black text-blue-700">{totalItems}個</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm shrink-0">
                <User size={12} className="text-indigo-500" />
                <span className="text-xs font-black text-indigo-700">
                  {completedOrders.length}
                  <span className="text-[10px] text-indigo-300 mx-0.5">/</span>
                  {orders.length}件
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center shrink-0">
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 opacity-40 ${completedOrders.length === orders.length ? "bg-emerald-400 scale-125" : "bg-indigo-400 scale-110"}`} />
            <div className="relative drop-shadow-lg transition-transform duration-500 hover:scale-105">
              <ProgressCircle current={completedOrders.length} total={orders.length} size={72} strokeWidth={10} />
            </div>
            {completedOrders.length === orders.length && orders.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-lg ring-2 ring-white animate-bounce">
                <Star size={10} fill="currentColor" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 注文リスト */}
      <div className="max-w-md mx-auto p-4 mt-4 space-y-4">
        {orders.length === 0 ? (
          <div className="flex justify-center items-center gap-2 py-20 text-gray-400 font-medium">
            集荷の注文が入っていません <Truck />
          </div>
        ) : (
          [...orders].sort((a, b) => (a.status === "completed" ? 1 : -1)).map((order) => <OrderCard key={order.id} order={order} onPickup={setSelectedOrder} />)
        )}
      </div>

      {/* モーダル類 */}
      {selectedOrder && <PickupModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onSuccess={handlePickupSuccess} />}
      {isSummaryOpen && <DailySummaryModal onClose={() => setIsSummaryOpen(false)} uid={uid} orders={orders} />}
      {user && <ClosingDayModal user={user} isOpen={isClosingDayOpen} onClose={() => setIsClosingDayOpen(false)} onSuccess={() => mutate()} />}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[-1]" onClick={() => setIsMenuOpen(false)} />}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          {incompleteOrders.length > 0 && (
            <button onClick={handleBatchRoute} disabled={isOptimizing} className="flex items-center gap-3 bg-white text-blue-600 px-4 py-3 rounded-2xl shadow-xl border border-blue-50 active:scale-95 transition-all">
              <span className="text-xs font-black uppercase tracking-wider">一括ルート表示</span>
              <div className="bg-blue-600 p-2 rounded-lg text-white">{isOptimizing ? <Loader2 size={18} className="animate-spin" /> : <Route size={18} />}</div>
            </button>
          )}
          <button
            onClick={() => {
              setIsSummaryOpen(true);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 bg-white text-emerald-600 px-4 py-3 rounded-2xl shadow-xl border border-emerald-50 active:scale-95 transition-all"
          >
            <span className="text-xs font-black uppercase tracking-wider">集計確認</span>
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <TrendingUp size={18} />
            </div>
          </button>
          <button
            onClick={() => {
              setIsClosingDayOpen(true);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-3 bg-white text-red-600 px-4 py-3 rounded-2xl shadow-xl border border-red-50 active:scale-95 transition-all"
          >
            <span className="text-xs font-black uppercase tracking-wider">業務終了</span>
            <div className="bg-red-600 p-2 rounded-lg text-white">
              <LogOut size={18} />
            </div>
          </button>
        </div>

        {!isAnyModalOpen && (
          <button onClick={() => setIsMenuOpen((prev) => !prev)} className={`w-10 h-10 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isMenuOpen ? "bg-slate-800 rotate-45 text-white" : "bg-blue-600 text-white shadow-blue-200 shadow-lg"}`}>
            <PlusIcon className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}
