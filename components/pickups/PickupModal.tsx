"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Package, Snowflake, Weight, X, Search, Plus, Minus, ChevronRight, ChevronDown } from "lucide-react";
import { calculateItemFee } from "@/lib/utils/calculateItemFee";
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

  // 1. 都道府県リストの抽出
  const currentGroupPrefs = useMemo(() => {
    return Object.entries(areaMapping)
      .filter(([_, groupId]) => groupId === selectedGroup)
      .map(([pref]) => pref);
  }, [selectedGroup]);

  // 2. 検索処理（自動エリア切り替え）
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

  // 3. アイテム追加
  const addItem = useCallback(() => {
    const groupLabel = prices.v2026_01[selectedGroup].label;
    const feeInfo = calculateItemFee({
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
    });

    if (feeInfo.subtotal === 0 || feeInfo.error) {
      showSnackbar("この条件では登録できません", "error");
      return;
    }

    setItems(prev => [...prev, {
      kind,
      to: groupLabel,
      size: kind === "heavy" ? null : Number(size),
      quantity: Number(quantity),
      subtotal: feeInfo.subtotal
    }]);
    
    // 追加後のリセット
    setQuantity(1);
    setSearchQuery("");
  }, [selectedGroup, kind, size, quantity, showSnackbar]);

  // 4. 合計金額の計算
  const totalFee = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [items]);

  // 追加時に自動スクロール
  useEffect(() => {
    if (items.length > 0) {
      itemsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items.length]);

  // 5. 最終登録処理
  const handleComplete = async () => {
    if (loading || items.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, status: "completed" }),
      });
      if (!response.ok) throw new Error();
      showSnackbar("集荷登録が完了しました", "success");
      onSuccess();
      onClose();
    } catch {
      showSnackbar("通信エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/90">
      <div className="relative bg-slate-900 w-full h-[96dvh] md:h-auto md:w-[90vw] md:max-w-4xl md:max-h-[90vh] md:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50 shrink-0">
          <div>
            <h1 className="text-sm font-black text-cyan-400">集荷登録システム</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest">ORDER: {order.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-700 rounded-lg text-white active:bg-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-40 custom-scrollbar overscroll-contain">
          
          {/* 1. Destination */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. 配送先の選択</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                inputMode="search"
                placeholder="都道府県を検索..." 
                value={searchQuery} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="w-full bg-slate-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-cyan-500 transition-colors" 
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(prices.v2026_01).map(([key, group]) => (
                <button 
                  key={key} 
                  onClick={() => setSelectedGroup(key as AreaGroupKey)} 
                  className={`py-3 rounded-lg text-[10px] font-black transition-all border ${selectedGroup === key ? "bg-cyan-600 border-cyan-400 text-white shadow-lg" : "bg-slate-800 border-white/5 text-slate-500 active:bg-slate-700"}`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            <div className="p-3 bg-black/20 rounded-xl flex flex-wrap gap-1.5 min-h-[40px]">
              {currentGroupPrefs.map((pref) => {
                const isMatched = searchQuery && (pref.startsWith(searchQuery.replace(/[都道府県]$/, "")) || pref === searchQuery);
                return (
                  <span key={pref} className={`text-[10px] px-2 py-1 rounded border transition-all ${isMatched ? "bg-cyan-500 text-white border-cyan-300" : "bg-slate-800/40 text-slate-600 border-transparent"}`}>{pref}</span>
                );
              })}
            </div>
          </section>

          {/* 2. Type & 3. Size */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. 配送種別</h2>
              <div className="flex gap-2">
                {[
                  { id: "normal", icon: Package, label: "通常", color: "cyan" },
                  { id: "chilled", icon: Snowflake, label: "チルド", color: "blue" },
                  { id: "heavy", icon: Weight, label: "重量物", color: "amber" }
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setKind(t.id as any)} 
                    className={`flex-1 py-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${kind === t.id ? `bg-${t.color}-500/20 border-${t.color}-500 text-${t.color}-400` : "bg-slate-800 border-transparent text-slate-600 active:bg-slate-700"}`}
                  >
                    <t.icon size={28} />
                    <span className="text-[10px] font-black">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {kind !== "heavy" && (
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. サイズ</h2>
                <div className="relative">
                  <select 
                    value={size} 
                    onChange={(e) => setSize(Number(e.target.value))} 
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-5 px-6 font-black text-xl appearance-none outline-none text-white active:bg-slate-700"
                  >
                    {Object.keys((prices.v2026_01[selectedGroup] as any)[kind === "chilled" ? "chilled" : "normal"]).map((s) => (
                      <option key={s} value={s}>{s}cm</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
                </div>
              </div>
            )}
          </section>

          {/* 4. Quantity */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">4. 数量</h2>
            <div className="flex items-center bg-slate-800 rounded-xl p-2 h-16 border border-white/5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-full bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600"><Minus size={20} /></button>
              <div className="flex-1 text-center font-black text-2xl tabular-nums text-white">{quantity}</div>
              <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-full bg-cyan-600 rounded-lg flex items-center justify-center active:bg-cyan-500"><Plus size={20} /></button>
            </div>
          </section>

          <button onClick={addItem} className="w-full bg-white text-black font-black py-5 rounded-xl active:scale-[0.98] transition-all text-lg shadow-xl flex items-center justify-center gap-2">
            リストに追加する <Plus size={20} />
          </button>

          {/* 登録済みリスト (詳細カード形式) */}
          <div className="bg-black/20 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-widest mb-2">登録済みアイテム一覧</h2>
            
            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-700 text-xs italic">追加されたアイテムはありません</div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm transition-all animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.kind === 'chilled' ? 'bg-blue-500/20 text-blue-400' : 
                        item.kind === 'heavy' ? 'bg-amber-500/20 text-amber-400' : 
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {item.kind === 'chilled' ? <Snowflake size={20} /> : item.kind === 'heavy' ? <Weight size={20} /> : <Package size={20} />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{item.to}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                            item.kind === 'chilled' ? 'bg-blue-600 text-white' : 
                            item.kind === 'heavy' ? 'bg-amber-600 text-white' : 
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {item.kind === 'chilled' ? 'チルド' : item.kind === 'heavy' ? '重量物' : '通常'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-bold">
                          {item.size ? `${item.size}サイズ` : '重量計上'} / 数量: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-white font-mono">¥{item.subtotal.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-600 font-bold">税込</div>
                      </div>
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-slate-600 active:text-red-500">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={itemsEndRef} />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-900 shrink-0">
          <div className="flex justify-between items-end mb-4 px-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">合計金額</span>
            <span className="text-4xl font-black text-cyan-400 italic font-mono">¥{totalFee.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleComplete}
            disabled={items.length === 0 || loading}
            className="w-full bg-cyan-600 text-white font-black py-5 rounded-xl text-lg disabled:opacity-20 active:bg-cyan-500 shadow-xl"
          >
            {loading ? "送信中..." : "この内容で登録を完了する"}
          </button>
        </div>
      </div>
    </div>
  );
}
