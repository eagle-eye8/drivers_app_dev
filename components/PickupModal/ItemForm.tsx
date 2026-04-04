"use client";

import { KindType } from "@/types/pickup";
import { ChevronDown, ChevronRight, Minus, Package, Plus, Snowflake, Weight } from "lucide-react";

interface Props {
  kind: KindType;
  setKind: (k: KindType) => void;
  size: number;
  setSize: (s: number) => void;
  sizeOptions: string[];
  quantity: number;
  setQuantity: (n: number | ((prev: number) => number)) => void;
  onAdd: () => void;
}

export function ItemForm({ kind, setKind, size, setSize, sizeOptions, quantity, setQuantity, onAdd }: Props) {
  return (
    <div className="space-y-8">
      <section>
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-4">2 · 発送タイプ</label>
        <div className="grid grid-cols-3 gap-3">
          {(["normal", "chilled", "heavy"] as KindType[]).map((t) => (
            <button key={t} onClick={() => setKind(t)} className={`flex flex-col items-center gap-3 py-3 rounded-[2rem] border-2 transition-all ${kind === t ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-800/30 border-white/5 text-slate-600"}`}>
              {t === "normal" ? <Package size={22} /> : t === "chilled" ? <Snowflake size={24} /> : <Weight size={24} />}
              <span className="text-[10px] font-black uppercase">{t === "normal" ? "通常" : t === "chilled" ? "冷蔵" : "重量物"}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-end gap-4">
        {kind !== "heavy" && (
          <section className="flex-1">
            <label className="text-[11px] font-black text-slate-500 mb-3 block">3 · サイズ</label>
            <div className="relative">
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl h-12 px-5 font-black text-xl text-white appearance-none outline-none focus:border-cyan-500">
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s} cm
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
            </div>
          </section>
        )}
        <section className="flex-1">
          <label className="text-[11px] font-black text-slate-500 mb-3 block">{kind !== "heavy" ? "4" : "3"} · 数量</label>
          <div className="flex items-center bg-slate-900 rounded-2xl border-2 border-white/5 h-12 overflow-hidden">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-14 h-full flex items-center justify-center text-slate-400 active:bg-slate-800">
              <Minus size={24} />
            </button>
            <div className="flex-1 text-center font-black text-2xl text-white">{quantity}</div>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-14 h-full flex items-center justify-center bg-cyan-600 text-white active:bg-cyan-700">
              <Plus size={24} />
            </button>
          </div>
        </section>
      </div>

      <button onClick={onAdd} className="w-full bg-white text-black font-black py-3 rounded-[2rem] active:scale-95 transition-all text-lg flex items-center justify-center gap-2 shadow-2xl">
        リストに追加する <ChevronRight size={20} />
      </button>
    </div>
  );
}
