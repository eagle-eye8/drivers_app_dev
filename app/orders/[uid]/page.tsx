"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import ProgressCircle from "@/components/ui/ProgressCircle";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Navigation, Phone, MapPin, TrendingUp, Route, Loader2, PlusIcon, Check, Copy, LogOut, Fuel, Package, CheckCircle2, PackageCheck, Star } from "lucide-react";
import { useState } from "react";
import { PickupModal } from "@/components/pickups/PickupModal";
import { getJstDateString } from "@/lib/utils/date";
import DailySummaryModal from "@/components/ui/DailySummaryModal";
import ClosingDayModal from "@/components/ClosingDayModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function IndividualOrdersPage() {
  const { uid } = useParams() as { uid: string };
  const today = getJstDateString();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isClosingDayOpen, setIsClosingDayOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, mutate } = useSWR(uid ? `/api/orders?date=${today}&uid=${uid}` : null, fetcher);
  const orders: OrderWithCustomer[] = data?.data || [];

  const incompleteOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0), 0);
  // Googleマップ一括表示ロジック
  // const handleBatchRoute = async () => {
  //   if (incompleteOrders.length === 0) return;
  //   setIsOptimizing(true);
  //   try {
  //     const res = await fetch("/api/orders/optimize", {
  //       method: "POST",
  //       body: JSON.stringify({ orders: incompleteOrders, originAddress: "現在地" }),
  //     });
  //     const json = await res.json();
  //     let target = [...incompleteOrders];
  //     if (json.success && json.optimizedIndices) {
  //       const intermediates = incompleteOrders.slice(0, -1);
  //       const sorted = json.optimizedIndices.map((idx: number) => intermediates[idx]);
  //       target = [...sorted, incompleteOrders[incompleteOrders.length - 1]];
  //     }
  //     openGoogleMaps(target);
  //   } catch (err) {
  //     alert("通常順で開きます。");
  //     openGoogleMaps(incompleteOrders);
  //   } finally {
  //     setIsOptimizing(false);
  //   }
  // };

  // Googleマップ一括表示（完全無料版）
  const handleBatchRoute = () => {
    if (incompleteOrders.length === 0) {
      alert("未完了の荷物はありません");
      return;
    }

    // URLの構築
    const origin = encodeURIComponent("現在地");

    // リストの最後を「目的地」に設定
    const destOrder = incompleteOrders[incompleteOrders.length - 1];
    const destination = encodeURIComponent(destOrder.customer?.address || "");

    // それ以外を「経由地」に設定
    const waypoints = incompleteOrders
      .slice(0, -1)
      .map((o) => encodeURIComponent(o.customer?.address || ""))
      .join("|");

    // Google Maps へのユニバーサルリンク
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;

    // 別タブ（またはアプリ）で開く
    window.open(url, "_blank");
  };

  // const openGoogleMaps = (targetOrders: OrderWithCustomer[]) => {
  //   const destination = encodeURIComponent(targetOrders[targetOrders.length - 1].customer?.address || "");
  //   const waypoints = targetOrders
  //     .slice(0, -1)
  //     .map((o) => encodeURIComponent(o.customer?.address || ""))
  //     .join("|");
  //   window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${waypoints}&travelmode=driving`, "_blank");
  // };

  if (!data) return <LoadingOverlay text="データを読み込み中..." />;
  if (isLoading) return <LoadingOverlay text="データを登録中..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 py-7 rounded-b-[3.5rem] shadow-xl sticky top-0 z-20 border-b border-slate-100">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* --- 左側：チップ・セクション（すべて横並び & 元の配色） --- */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">集荷サマリー</h1>

            <div className="flex flex-wrap items-center gap-2">
              {/* 売上チップ */}
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm shrink-0">
                <TrendingUp size={12} className="text-emerald-600" />
                <span className="text-xs font-black text-emerald-700">¥{totalSales.toLocaleString()}</span>
              </div>

              {/* 総個数チップ */}
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm shrink-0">
                <Package size={12} className="text-blue-500" />
                <span className="text-xs font-black text-blue-700">{totalItems}個</span>
              </div>

              {/* 進捗件数チップ（横並びに追加） */}
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm shrink-0">
                <PackageCheck size={12} className="text-indigo-500" />
                <span className="text-xs font-black text-indigo-700">
                  {completedOrders.length}
                  <span className="text-[10px] text-indigo-300 mx-0.5">/</span>
                  {orders.length}件
                </span>
              </div>
            </div>
          </div>

          {/* --- 右側：リッチ・進捗サークル --- */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* 1. 外側の後光（グローエフェクト）: 達成率に応じて Indigo から Emerald へ変化 */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 opacity-40 ${completedOrders.length === orders.length ? "bg-emerald-400 scale-125" : "bg-indigo-400 scale-110"}`} />

            <div className="relative">
              {/* 2. プログレスサークル本体：太めのストロークで重厚感を出す */}
              <div className="drop-shadow-lg transition-transform duration-500 hover:scale-105">
                <ProgressCircle current={completedOrders.length} total={orders.length} size={72} strokeWidth={10} />
              </div>
              {/* 4. 100%達成時の祝祭アイコン */}
              {completedOrders.length === orders.length && orders.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-lg ring-2 ring-white animate-bounce">
                  <Star size={10} fill="currentColor" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{" "}
      {/* 注文リスト */}
      <div className="max-w-md mx-auto p-4 mt-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium italic">No missions scheduled today.</div>
        ) : (
          [...orders]
            .sort((a, b) => (a.status === "completed" ? 1 : -1))
            .map((order) => {
              const isCompleted = order.status === "completed";
              // アイテム数の合計（reduceを使用）
              const totalQty = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 0;

              return (
                <div key={order.id} className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all duration-500 ${isCompleted ? "opacity-40 grayscale bg-gray-50 border-transparent" : "border-white shadow-blue-100/50"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">ID: {order.id.slice(-4)}</span>
                        {/* 個数バッジ */}
                        <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-full font-bold text-blue-600 flex items-center gap-1">
                          <Package size={10} /> {totalQty} 個
                        </span>
                        {/* 売上バッジ（金額がある場合のみ表示） */}
                        {order.amount > 0 && (
                          <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-emerald-60 flex items-center gap-1">
                            <TrendingUp size={10} />¥ {order.amount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-extrabold text-gray-800 leading-tight">{order.customer?.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400 flex items-center gap-1 font-medium mt-1">
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
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer?.address || "")}`)} className={`p-3 rounded-2xl transition-all active:scale-90 ${isCompleted ? "bg-gray-200 text-gray-400" : "bg-blue-50 text-blue-600"}`}>
                      <Navigation size={20} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button disabled={isCompleted} onClick={() => setSelectedOrder(order)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${isCompleted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white shadow-lg shadow-gray-200"}`}>
                      {isCompleted ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={16} /> 完了済み
                        </div>
                      ) : (
                        "集荷を開始する"
                      )}
                    </button>

                    {order.customer?.phone && !isCompleted && (
                      <a href={`tel:${order.customer.phone}`} className="p-4 bg-gray-100 text-gray-500 rounded-2xl active:bg-gray-200 transition-colors">
                        <Phone size={20} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
      {/* モーダル類 */}
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
      {isSummaryOpen && <DailySummaryModal onClose={() => setIsSummaryOpen(false)} isAdmin={false} uid={uid} orders={orders} />}
      {/* 業務終了（経費入力）モーダル */}
      <ClosingDayModal
        isOpen={isClosingDayOpen}
        onClose={() => setIsClosingDayOpen(false)}
        onSuccess={() => mutate()} // 報告後にデータを最新にする
      />
      {/* FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[-1]" onClick={() => setIsMenuOpen(false)} />}

        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          {/* 一括ルート作成 */}
          {incompleteOrders.length > 0 && (
            <button onClick={handleBatchRoute} disabled={isOptimizing} className="flex items-center gap-3 bg-white text-blue-600 px-4 py-3 rounded-2xl shadow-xl border border-blue-50 active:scale-95 transition-all">
              <span className="text-xs font-black uppercase tracking-wider">一括ルート表示</span>
              <div className="bg-blue-600 p-2 rounded-lg text-white">{isOptimizing ? <Loader2 size={18} className="animate-spin" /> : <Route size={18} />}</div>
            </button>
          )}

          {/* 集計確認 */}
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

          {/* 業務終了ボタン */}
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

        {/* メインのプラスボタン */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isMenuOpen ? "bg-slate-800 rotate-45 text-white" : "bg-blue-600 text-white shadow-blue-200 shadow-lg"}`}>
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
