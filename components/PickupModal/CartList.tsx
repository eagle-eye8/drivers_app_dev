"use client";

import { Check, Package, Snowflake, Weight, X } from "lucide-react";
import { CartItem } from ".";

interface Props {
  items: CartItem[];
  onRemove: (index: number) => void;
  totalFee: number;
  onComplete: () => void;
  submitting: boolean;
}

export function CartList({ items, onRemove, totalFee, onComplete, submitting }: Props) {
  return (
    <div className="flex flex-col bg-black/20 rounded-[2.5rem] border border-white/5 p-6 h-full">
      <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3 text-center">集荷リスト</h2>
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[50px] pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <Package size={64} className="mb-4" />
            <p className="text-xs font-black uppercase">No Items</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-cyan-400">{item.kind === "normal" ? <Package size={18} /> : item.kind === "chilled" ? <Snowflake size={18} /> : <Weight size={18} />}</div>
                <div>
                  <p className="text-sm font-black text-white">
                    {item.to} / {item.size ?? "重量"}
                  </p>
                  <p className="text-[10px] text-cyan-500 font-black tracking-widest">個数: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-black text-white">¥ {item.subtotal.toLocaleString()}</span>
                <button onClick={() => onRemove(i)} className="text-slate-600 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
        <div className="flex justify-between items-end px-2">
          <span className="text-[11px] font-black text-slate-500 uppercase">Total</span>
          <span className="text-4xl font-black font-mono text-cyan-400">¥{totalFee.toLocaleString()}</span>
        </div>
        <button onClick={onComplete} disabled={items.length === 0 || submitting} className="w-full bg-cyan-600 text-white font-black py-6 rounded-[2rem] active:scale-[0.97] transition-all text-xl shadow-xl disabled:opacity-10 disabled:grayscale">
          {submitting ? (
            "Saving..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Check size={24} /> 集荷完了
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
