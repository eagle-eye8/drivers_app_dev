"use client";

import { useState } from "react";
import { Order } from "@/types/order";
import { Prefecture } from "@/lib/constants/priceTable/index";
import { Calculator, Package, Snowflake, Weight } from "lucide-react";
import { calculateItemFee } from "@/lib/utils/calculateItemFee";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { PRICE_TABLE } from "@/lib/constants/priceTable";
import { useSnackbar } from "../ui/SnackbarProvider";
type Props = {
  order: Order;
  onClose: () => void;
  onCompleted: () => void;
};

export function PickupModal({ order, onClose, onCompleted }: Props) {
  // const [items, setItems] = useState<OrderItem[]>([(order.items)]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [kind, setKind] = useState<"normal" | "chilled" | "heavy">("normal");
  const [prefecture, setPrefecture] = useState<Prefecture>("東京都");
  const [size, setSize] = useState<number>(60);
  const [quantity, setQuantity] = useState<number>(1);

  const prefectures = Object.keys(PRICE_TABLE) as Prefecture[];

  const addItem = () => {
    if (kind === "heavy") {
      setItems([...items, { kind: "heavy", to: prefecture, quantity }]);
    } else if (kind === "normal") {
      setItems([...items, { kind: "normal", to: prefecture, size: size as NormalSize, quantity }]);
    } else {
      setItems([...items, { kind: "chilled", to: prefecture, size: size as ChilledSize, quantity }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalFee = items.reduce((sum, item) => {
    return sum + calculateItemFee(item, "v2025_01").subtotal;
  }, 0);

  const getSizeOptions = () => {
    if (kind === "heavy") return [];
    if (kind === "normal") return [60, 80, 100, 120, 140, 160, 170];
    return [60, 80, 120, 140, 150];
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          status: "completed",
        }),
      });
      showSnackbar("集荷を完了しました", "success");
      setCompleted(true);
      onCompleted();
      onClose();
    } catch {
      showSnackbar("登録に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 md:flex md:items-center md:justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 text-white w-full h-full md:h-auto md:w-[95vw] md:max-w-6xl md:max-h-[90vh] md:rounded-2xl overflow-y-auto transition-all">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-2">
                <Calculator className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">集荷項目セット</h1>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700/50 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">配送方法</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setKind("normal")} className={`p-3 rounded-lg transition-all ${kind === "normal" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50" : "bg-slate-700/50 hover:bg-slate-700"}`}>
                      <Package className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs block">普通</span>
                    </button>
                    <button onClick={() => setKind("chilled")} className={`p-3 rounded-lg transition-all ${kind === "chilled" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50" : "bg-slate-700/50 hover:bg-slate-700"}`}>
                      <Snowflake className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs block">チルド</span>
                    </button>
                    <button onClick={() => setKind("heavy")} className={`p-3 rounded-lg transition-all ${kind === "heavy" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50" : "bg-slate-700/50 hover:bg-slate-700"}`}>
                      <Weight className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs block">重量物</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">配送先</label>
                  <select value={prefecture} onChange={(e) => setPrefecture(e.target.value as Prefecture)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {prefectures.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {kind !== "heavy" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">サイズ (cm)</label>
                    <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      {getSizeOptions().map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">数量</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              <button onClick={addItem} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50">
                注文に追加
              </button>
            </div>

            {items.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-cyan-400">注文明細</h2>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const fee = calculateItemFee(item, "v2025_01");
                    return (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700/50 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${item.kind === "normal" ? "bg-cyan-500/20" : item.kind === "chilled" ? "bg-blue-500/20" : "bg-amber-500/20"}`}>
                            {item.kind === "normal" && <Package className="w-5 h-5 text-cyan-400" />}
                            {item.kind === "chilled" && <Snowflake className="w-5 h-5 text-blue-400" />}
                            {item.kind === "heavy" && <Weight className="w-5 h-5 text-amber-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.to} / {item.kind === "normal" ? "普通" : item.kind === "chilled" ? "チルド" : "重量物"}
                              {item.kind !== "heavy" && ` / ${item.size}cm`}
                            </div>
                            <div className="text-sm text-slate-400">
                              ¥{fee.unitPrice.toLocaleString()} × {item.quantity}個
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-cyan-400">¥{fee.subtotal.toLocaleString()}</div>
                          </div>
                        </div>
                        <button onClick={() => removeItem(index)} className="ml-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center justify-between text-2xl font-bold mb-6">
                    <span className="text-slate-300">合計金額</span>
                    <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">¥{totalFee.toLocaleString()}</span>
                  </div>

                  <button onClick={handleComplete} disabled={loading || completed} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                    {loading ? "処理中..." : completed ? "集荷完了済み" : "集荷完了"}
                  </button>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="bg-slate-800/30 backdrop-blur rounded-2xl p-12 border border-slate-700/50 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">注文を追加してください</p>
              </div>
            )}
          </div>
          {loading && <LoadingOverlay text="集荷完了を登録しています…" />}
        </div>
      </div>
    </div>
  );
}
