"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Package, Snowflake, Weight, X, Search, Plus, Minus, ChevronRight, ChevronDown } from "lucide-react";
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

  // 1. 都道府県リストの抽出（メモ化で高速化）
  const currentGroupPrefs = useMemo(() => {
    return Object.entries(areaMapping)
      .filter(([_, groupId]) => groupId === selectedGroup)
      .map(([pref]) => pref);
  }, [selectedGroup]);

  // 2. 検索処理
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) return;
    const normalizedQuery = query.replace(/[都道府県]$/, "");
    const matchedEntry = Object.entries(areaMapping).find(([prefName]) => 
      prefName.startsWith(normalizedQuery) || prefName === query
    );
    if (matchedEntry) {
      setSelectedGroup(matchedEntry[1] as AreaGroupKey);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      itemsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items]);

  const addItem = useCallback(() => {
    const groupLabel = prices.v2026_01[selectedGroup].label;
    const feeInfo = calculateItemFee({
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
    });

    if (feeInfo.subtotal === 0 || feeInfo.error) {
      showSnackbar("設定エラー", "error");
      return;
    }

    setItems(prev => [...prev, {
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
      subtotal: feeInfo.subtotal
    }]);
    setQuantity(1);
    setSearchQuery("");
  }, [selectedGroup, kind, size, quantity, showSnackbar]);

  const totalFee = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [items]);

  const handleComplete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, status: "completed" }),
      });
      if (!response.ok) throw new Error();
      showSnackbar("完了", "success");
      onSuccess();
      onClose();
    } catch {
      showSnackbar("エラー", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative bg-slate-950 text-white w-full h-full md:h-auto md:w-[95vw] md:max-w-5xl md:max-h-[92vh] md:rounded-[3rem] overflow-hidden border border-white/10 flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/20 shrink-0">
          <div>
            <h1 className="text-lg font-black tracking-tighter text-cyan-400">集荷登録</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order: {order.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl active:scale-90 transition-transform text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            
            <div className="space-y-8">
              {/* 1. Destination (エリアと都道府県表示) */}
              <section>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">1. 行き先</label>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    inputMode="search"
                    placeholder="都道府県を検索..." 
                    value={searchQuery} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 font-bold text-base outline-none focus:ring-1 focus:ring-cyan-500" 
                  />
                </div>
                
                {/* エリア選択ボタン */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(prices.v2026_01).map(([key, group]) => (
                    <button 
                      key={key} 
                      onClick={() => setSelectedGroup(key as AreaGroupKey)} 
                      className={`py-3 rounded-xl text-[9px] font-black transition-all border ${selectedGroup === key ? "bg-cyan-600 border-cyan-400 text-white shadow-lg" : "bg-slate-800/40 border-white/5 text-slate-500"}`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>

                {/* 【復活】選択中エリアの都道府県リスト */}
                <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-wrap gap-2 min-h-[70px] items-center">
                  {currentGroupPrefs.map((pref) => {
                    const isMatched = searchQuery && (pref.startsWith(searchQuery.replace(/[都道府県]$/, "")) || pref === searchQuery);
                    return (
                      <span 
                        key={pref} 
                        className={`text-[10px] px-2.5 py-1 rounded-md transition-all duration-300 border ${isMatched ? "bg-cyan-500 text-white border-cyan-300 scale-110 shadow-lg z-10" : "bg-slate-800/60 text-slate-500 border-white/5"}`}
                      >
                        {pref}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* 2. Type & 3. Size */}
              <div className="flex flex-col sm:flex-row gap-8">
                <section className="flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">2. 発送タイプ</label>
                  <div className="flex gap-3">
                    {["normal", "chilled", "heavy"].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setKind(t as any)} 
                        className={`flex-1 p-5 rounded-2xl border-2 transition-all ${kind === t ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-900 border-white/5 text-slate-700"}`}
                      >
                        {t === "normal" && <Package className="mx-auto" size={28} />}
                        {t === "chilled" && <Snowflake className="mx-auto" size={28} />}
                        {t === "heavy" && <Weight className="mx-auto" size={28} />}
                      </button>
                    ))}
                  </div>
                </section>

                {kind !== "heavy" && (
                  <section className="flex-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">3. サイズ</label>
                    <div className="relative group">
                      <select 
                        value={size} 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setSize(Number(e.target.value))} 
                        className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl py-5 px-6 font-black text-xl appearance-none outline-none focus:border-cyan-500 text-white touch-manipulation cursor-pointer"
                      >
                        {Object.keys((prices.v2026_01[selectedGroup] as any)[kind === "chilled" ? "chilled" : "normal"]).map((s) => (
                          <option key={s} value={s}>{s}cm</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-cyan-400">
                        <ChevronDown size={24} />
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* 4. Quantity */}
              <section>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">4. 数量</label>
                <div className="flex items-center bg-slate-900 rounded-3xl p-2.5 border border-white/5">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center bg-slate-800 rounded-2xl active:scale-90 transition-transform"><Minus size={24} /></button>
                  <div className="flex-1 text-center font-black text-3xl tabular-nums">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center bg-cyan-600 rounded-2xl active:scale-90 transition-transform"><Plus size={24} /></button>
                </div>
              </section>

              <button onClick={addItem} className="w-full bg-white text-black font-black py-6 rounded-3xl active:scale-[0.98] transition-all text-lg shadow-2xl flex items-center justify-center gap-3">
                ADD TO LIST <ChevronRight size={20} />
              </button>
            </div>

            {/* 右側：サマリー表示 */}
            <div className="flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-white/10 p-6 md:p-8 min-h-[450px]">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 text-center">合計</h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-800">
                    <Package size={64} className="mb-4 opacity-5" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">入力がありません</p>
                  </div>
                ) : (
                  items.map((item, i) => (
                    <div key={i} className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 flex justify-between items-center group animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5">
                          {item.kind === "normal" ? <Package size={20} /> : item.kind === "chilled" ? <Snowflake size={20} /> : <Weight size={20} />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black italic">{item.to} <span className="text-slate-600 font-normal">/</span> {item.size ? `${item.size}cm` : "重量物"}</p>
                          <p className="text-[11px] text-slate-500 font-bold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-sm">¥{item.subtotal.toLocaleString()}</span>
                        <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="p-2.5 bg-slate-900/50 text-slate-600 hover:text-red-500 rounded-xl transition-all"><X size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={itemsEndRef} />
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-8 px-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">料金</span>
                  <span className="text-5xl font-black font-mono text-cyan-400 italic tracking-tighter">¥ {totalFee.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleComplete} 
                  disabled={items.length === 0 || loading} 
                  className="w-full bg-cyan-600 text-white font-black py-6 rounded-[2rem] active:scale-95 transition-all text-xl shadow-2xl shadow-cyan-500/20 disabled:opacity-20"
                >
                  {loading ? "登録中..." : "COMPLETE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
