"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Navigation, Phone, MapPin, TrendingUp, Route, Loader2, PlusIcon, Check, Copy } from "lucide-react";
import { useState } from "react";
import { PickupModal } from "@/components/pickups/PickupModal";
import { getJstDateString } from "@/lib/utils/date";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function IndividualOrdersPage() {
  const { uid } = useParams();
  const today = getJstDateString();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false); // 最適化中フラグ
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data, mutate } = useSWR(uid ? `/api/orders?date=${today}&uid=${uid}` : null, fetcher);
  const orders: OrderWithCustomer[] = data?.data || [];

  const incompleteOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // ★ 一括ルート作成（必要な時だけAPIを実行）
  const handleBatchRoute = async () => {
    if (incompleteOrders.length === 0) return;

    setIsOptimizing(true);
    try {
      // 1. 最適化APIを呼び出し、最適な順番（インデックス）を取得
      const res = await fetch("/api/orders/optimize", {
        method: "POST",
        body: JSON.stringify({
          orders: incompleteOrders,
          originAddress: "現在地", // または拠点の住所
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429 || json.errorType === "QUOTA_EXCEEDED") {
          alert("【使用上限エラー】本日のルート最適化回数が上限に達しました。恐れ入りますが、手動でルートを確認してください。");
          // 失敗してもそのままGoogleマップを開く（最適化はされないがナビはできる）
          openGoogleMaps(incompleteOrders);
          return;
        }
        throw new Error("最適化に失敗しました");
      }

      let sorted = [...incompleteOrders];
      if (json.success && json.optimizedIndices) {
        // 2. 取得したインデックス順に並び替え
        const intermediates = incompleteOrders.slice(0, -1);
        const sortedIntermediates = json.optimizedIndices.map((idx: number) => intermediates[idx]);
        sorted = [...sortedIntermediates, incompleteOrders[incompleteOrders.length - 1]];
      }
      openGoogleMaps(sorted);
    } catch (err) {
      console.error(err);
      alert("ルートの最適化に失敗しました。通常順で開きます。");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Googleマップを開く処理を共通化
  const openGoogleMaps = (targetOrders: OrderWithCustomer[]) => {
    const destination = encodeURIComponent(targetOrders[targetOrders.length - 1].customer?.address || "");
    const waypoints = targetOrders
      .slice(0, -1)
      .map((o) => encodeURIComponent(o.customer?.address || ""))
      .join("|");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${waypoints}&travelmode=driving`, "_blank");
  };
  if (!data) return <LoadingOverlay text="データを読み込み中..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー: 常に上部に固定して操作性を確保 */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-md sticky top-0 z-20 border-b border-blue-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-gray-800 italic">MISSION</h1>
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">
              <TrendingUp size={14} />
              <span>¥{totalSales.toLocaleString()}</span>
            </div>
          </div>
          <ProgressCircle current={completedOrders.length} total={orders.length} size={60} strokeWidth={6} />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 mt-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">本日の予定はありません</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all ${order.status === "completed" ? "opacity-40 grayscale" : "border-transparent"}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  {/* ボタンが重ならないよう少し右に隙間を作る */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">注文ID: {order.id.slice(-4)}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-800 leading-tight">{order.customer?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1 font-medium italic">
                      <MapPin size={12} className="text-blue-500" /> {order.customer?.address}
                    </p>

                    {/* 住所コピーボタン */}
                    <button
                      onClick={async () => {
                        if (!order.customer?.address) return;
                        await navigator.clipboard.writeText(order.customer.address);
                        setCopiedId(order.id); // コピー成功時にIDを記録
                        setTimeout(() => setCopiedId(null), 2000); // 2秒後に元に戻す
                      }}
                      className={`p-1.5 rounded-lg transition-all shrink-0 ${copiedId === order.id ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-gray-100 text-gray-400 active:bg-gray-200"}`}
                    >
                      {copiedId === order.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                {/* 個別ナビボタン */}
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer?.address || "")}`)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:bg-blue-100 transition-colors">
                  <Navigation size={20} />
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button disabled={order.status === "completed"} onClick={() => setSelectedOrder(order)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${order.status === "completed" ? "bg-gray-50 text-gray-300" : "bg-gray-900 text-white shadow-lg shadow-gray-200"}`}>
                  {order.status === "completed" ? "完了済み" : "集荷を開始する"}
                </button>
                {order.customer?.phone && (
                  <a href={`tel:${order.customer.phone}`} className="p-4 bg-gray-100 text-gray-500 rounded-2xl active:bg-gray-200 transition-colors">
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
            mutate();
            setSelectedOrder(null);
          }}
        />
      )}

      {/* ================= FLOATING ACTION BUTTON (FAB) ================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* メニュー展開時のバックドロップ（メニューが開いている時だけ表示） */}
        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[-1]" onClick={() => setIsMenuOpen(false)} />}

        {/* 展開されるメニュー項目 */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          {/* 一括最適化ボタン: スマホで最も押しやすい位置 */}
          {incompleteOrders.length > 0 && (
            <button onClick={handleBatchRoute} disabled={isOptimizing} className="flex flex-col items-center justify-center bg-blue-600 text-white w-16 h-16 rounded-2xl shadow-lg shadow-blue-200 active:scale-90 transition-all disabled:bg-gray-400">
              {isOptimizing ? <Loader2 size={24} className="animate-spin" /> : <Route size={24} />}
              <span className="text-[9px] font-bold mt-1">{isOptimizing ? "計算中" : "一括ルート作成"}</span>
            </button>
          )}
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isMenuOpen ? "bg-slate-800 rotate-45 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
