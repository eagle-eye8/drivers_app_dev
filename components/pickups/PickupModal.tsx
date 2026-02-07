"use client";

import { useState, useRef, useEffect } from "react";
import { Package, Snowflake, Weight, X, Search, Plus, Minus, ChevronRight } from "lucide-react";
import { calculateItemFee } from "@/lib/utils/calculateItemFee";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";

import prices from "@/lib/constants/priceTable/shippingPrices.json";
import areaMapping from "@/lib/constants/priceTable/areaMapping.json";

export type AreaGroupKey = keyof typeof prices.v2026_01;

interface PickupModalProps {
  order: { id: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function PickupModal({ order, onClose, onSuccess }: PickupModalProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const { showSnackbar } = useSnackbar();

  const [selectedGroup, setSelectedGroup] = useState<AreaGroupKey>("tohoku_kanto");
  const [searchQuery, setSearchQuery] = useState("");
  const [kind, setKind] = useState<"normal" | "chilled" | "heavy">("normal");
  const [size, setSize] = useState<number>(60);
  const [quantity, setQuantity] = useState<number>(1);

  const itemsEndRef = useRef<HTMLDivElement>(null);

  // 検索ヒット時にグループを自動切り替え
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) return;

    const normalizedQuery = query.replace(/[都道府県]$/, "");
    const matchedEntry = Object.entries(areaMapping).find(([prefName]) => 
      prefName.startsWith(normalizedQuery) || prefName === query
    );

    if (matchedEntry) {
      setSelectedGroup(matchedEntry[1] as AreaGroupKey);
    }
  };

  useEffect(() => {
    if (items.length > 0) {
      itemsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items]);

  const addItem = () => {
    const groupLabel = prices.v2026_01[selectedGroup].label;
    const feeInfo = calculateItemFee({
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
    });

    if (feeInfo.subtotal === 0 || feeInfo.error) {
      showSnackbar("このサイズ・種別の組み合わせは料金が設定されていません", "error");
      return;
    }

    const item = {
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
    };

    setItems([...items, item]);
    setQuantity(1);
    setSearchQuery("");
  };

  const totalFee = items.reduce((sum, item) => {
    return sum + calculateItemFee(item, "v2026_01").subtotal;
  }, 0);

  // 現在のグループに属する県名リスト
  const currentGroupPrefs = Object.entries(areaMapping)
    .filter(([_, groupId]) => groupId === selectedGroup)
    .map(([pref]) => pref);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, status: "completed" }),
      });
      if (!response.ok) throw new Error();
      showSnackbar("集荷を完了しました", "success");
      onSuccess();
      onClose();
    } catch {
      showSnackbar("登録に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md md:flex md:items-center md:justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 text-white w-full h-full md:h-auto md:w-[95vw] md:max-w-5xl md:max-h-[92vh] md:rounded-[3rem] overflow-hidden border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-cyan-400 italic">PICKUP TERMINAL</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order ID: {order.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 rounded-2xl active:scale-75 transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              {/* 1. Destination */}
              <section>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">1. Select Destination</label>
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="都道府県名を入力..." 
                    value={searchQuery} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyan-500 font-bold text-lg outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(prices.v2026_01).map(([key, group]) => (
                    <button 
                      key={key} 
                      onClick={() => setSelectedGroup(key as AreaGroupKey)} 
                      className={`py-3 rounded-xl text-[10px] font-black transition-all active:scale-95 border ${selectedGroup === key ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20" : "bg-slate-800/50 border-white/5 text-slate-500"}`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>

                {/* --- 演出強化ポイント: 同期したフワフワ & ヒット強調 --- */}
                <div className="mt-3 p-3 bg-black/20 rounded-2xl border border-white/5 flex flex-wrap gap-1.5 min-h-[60px] items-center">
                  {currentGroupPrefs.map((pref) => {
                    // 入力文字と部分一致するか判定
                    const isMatched = searchQuery && (pref.startsWith(searchQuery.replace(/[都道府県]$/, "")) || pref === searchQuery);
                    
                    return (
                      <span 
                        key={pref} 
                        className={`
                          text-[9px] px-2 py-0.5 rounded-md transition-all duration-300 border
                          ${isMatched 
                            ? "bg-cyan-500 text-white border-cyan-300 scale-110 shadow-lg shadow-cyan-500/40 z-10" 
                            : "bg-slate-800 text-slate-400 border-white/5 animate-pulse"
                          }
                        `}
                      >
                        {pref}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* 2. Type & Size */}
              <section className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">2. Type</label>
                  <div className="flex gap-2">
                    <button onClick={() => setKind("normal")} className={`flex-1 p-4 rounded-2xl active:scale-90 transition-all ${kind === "normal" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-600"}`}><Package className="mx-auto" /></button>
                    <button onClick={() => setKind("chilled")} className={`flex-1 p-4 rounded-2xl active:scale-90 transition-all ${kind === "chilled" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-600"}`}><Snowflake className="mx-auto" /></button>
                    <button onClick={() => setKind("heavy")} className={`flex-1 p-4 rounded-2xl active:scale-90 transition-all ${kind === "heavy" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-600"}`}><Weight className="mx-auto" /></button>
                  </div>
                </div>
                {kind !== "heavy" && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">3. Size</label>
                    <select 
                      value={size} 
                      onChange={(e) => setSize(Number(e.target.value))} 
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-4 font-black text-lg appearance-none focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      {Object.keys((prices.v2026_01[selectedGroup] as any)[kind === "chilled" ? "chilled" : "normal"]).map((s) => (
                        <option key={s} value={s}>{s}cm</option>
                      ))}
                    </select>
                  </div>
                )}
              </section>

              {/* 3. Quantity */}
              <section>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">4. Quantity</label>
                <div className="flex items-center bg-slate-800 rounded-2xl p-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-xl active:scale-75 transition-all"><Minus size={20} /></button>
                  <div className="flex-1 text-center font-black text-2xl">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-cyan-500 rounded-xl active:scale-75 transition-all"><Plus size={20} /></button>
                </div>
              </section>

              <button onClick={addItem} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 rounded-2xl active:scale-[0.97] transition-all shadow-xl shadow-cyan-500/20 text-lg flex items-center justify-center gap-2">
                ADD TO LIST <ChevronRight size={20} />
              </button>
            </div>

            {/* 右側：明細プレビュー */}
            <div className="flex flex-col bg-black/20 rounded-[2rem] border border-white/5 p-6 min-h-[450px]">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 text-center">Current Items</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
                    <Package size={64} className="mb-4 opacity-10" />
                    <p className="text-sm">リストは空です</p>
                  </div>
                ) : (
                  items.map((item, i) => (
                    <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-cyan-400">
                          {item.kind === "normal" ? <Package size={18} /> : item.kind === "chilled" ? <Snowflake size={18} /> : <Weight size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-black">
                            {item.to} <span className="text-slate-500">/</span> {item.size ? `${item.size}cm` : "重量物"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold">数量: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-white text-sm">¥{calculateItemFee(item, "v2026_01").subtotal.toLocaleString()}</span>
                        <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-2 text-slate-600 hover:text-red-400 active:scale-50 transition-all"><X size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={itemsEndRef} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-end mb-6 px-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-4xl font-black font-mono text-cyan-400 tracking-tighter italic">¥{totalFee.toLocaleString()}</span>
                </div>
                <button onClick={handleComplete} disabled={items.length === 0 || loading} className="w-full bg-white text-slate-900 font-black py-5 rounded-3xl active:scale-95 transition-all text-xl shadow-2xl hover:bg-cyan-50 disabled:opacity-20 disabled:grayscale relative h-[70px]">
                  {loading ? <LoadingOverlay text="登録中..." /> : "REGISTER COMPLETE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
