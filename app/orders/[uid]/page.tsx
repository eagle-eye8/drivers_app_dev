"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Navigation, Package, Phone, MapPin, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PickupModal } from "@/components/pickups/PickupModal";
import { getJstDateKey } from "@/lib/date";
import { getJstDateString } from "@/lib/utils/date";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function IndividualOrdersPage() {
  const { uid } = useParams();
  const today = getJstDateString();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);

  // API経由でデータを取得 (SWRで自動キャッシュ＆リフレッシュ)
  const { data, error, mutate } = useSWR(uid ? `/api/orders?date=${today}&uid=${uid}` : null, fetcher);

  const orders: OrderWithCustomer[] = data?.data || [];
  const loading = !data && !error;

  // 集計計算
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  if (loading) return <LoadingOverlay text="本日のルートを読み込み中..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* デザイン済みのリッチヘッダー */}
      <div className="bg-white p-6 rounded-b-[3rem] shadow-lg border-b border-blue-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">My Mission</h1>
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm w-fit">
              <TrendingUp size={14} />
              <span>Today: ¥{totalSales.toLocaleString()}</span>
            </div>
          </div>
          <ProgressCircle current={completedOrders.length} total={orders.length} size={80} strokeWidth={8} />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 mt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">タスクはありません。</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`bg-white rounded-3xl p-5 shadow-sm border ${order.status === "completed" ? "opacity-50" : "border-white"}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-800">{order.customer?.name}</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                    <MapPin size={12} /> {order.customer?.address}
                  </p>
                </div>
                {/* 経路表示ボタン */}
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer?.address || "")}`)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all">
                  <Navigation size={20} />
                </button>
              </div>

              <div className="flex gap-2">
                <button disabled={order.status === "completed"} onClick={() => setSelectedOrder(order)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${order.status === "completed" ? "bg-gray-100 text-gray-400" : "bg-gray-900 text-white shadow-xl shadow-gray-200"}`}>
                  {order.status === "completed" ? "集荷完了" : "集荷詳細・完了報告"}
                </button>
                {order.customer?.phone && (
                  <a href={`tel:${order.customer.phone}`} className="p-4 bg-gray-100 text-gray-600 rounded-2xl">
                    <Phone size={20} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <PickupModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={() => {
            mutate(); // SWRのデータを再検証して画面を更新
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
