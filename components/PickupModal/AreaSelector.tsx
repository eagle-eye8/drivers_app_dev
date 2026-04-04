"use client";

import areaMapping from "@/lib/constants/priceTable/areaMapping.json";
import prices from "@/lib/constants/priceTable/shippingPrices.json";
import { AreaGroupKey } from "@/lib/constants/priceTable/v2026_01";
import { Search } from "lucide-react";
import { memo, useDeferredValue, useTransition } from "react";

const AREA_ENTRIES = Object.entries(areaMapping) as [string, AreaGroupKey][];
const AREA_GROUPS = Object.entries(prices.v2026_01);
const PREFS_BY_GROUP = AREA_ENTRIES.reduce<Record<string, string[]>>((acc, [pref, group]) => {
  if (!acc[group]) acc[group] = [];
  acc[group].push(pref);
  return acc;
}, {});

interface Props {
  selectedGroup: AreaGroupKey;
  onGroupSelect: (key: AreaGroupKey) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export const AreaSelector = memo(function AreaSelector({ selectedGroup, onGroupSelect, searchQuery, onSearch }: Props) {
  const [isPending, startTransition] = useTransition();
  const deferredGroup = useDeferredValue(selectedGroup);
  const deferredSearch = useDeferredValue(searchQuery);

  const handleSearchChange = (query: string) => {
    onSearch(query);
    const normalized = query.replace(/[都道府県]$/, "");
    const matched = AREA_ENTRIES.find(([pref]) => pref.startsWith(normalized));
    if (matched) {
      startTransition(() => onGroupSelect(matched[1]));
    }
  };

  const prefs = PREFS_BY_GROUP[deferredGroup] ?? [];

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">1 · 行き先</label>
        {isPending && <span className="text-[11px] text-cyan-500 font-black animate-pulse uppercase">Updating...</span>}
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
        <input type="text" inputMode="search" autoComplete="off" placeholder="都道府県を検索..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-base font-bold text-white outline-none focus:border-cyan-500 transition-all" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {AREA_GROUPS.map(([key, group]: [any, any]) => (
          <button key={key} onClick={() => onGroupSelect(key)} className={`py-2 rounded-lg text-[10px] font-black border transition-all ${selectedGroup === key ? "bg-cyan-600 border-cyan-400 text-white shadow-sm" : "bg-slate-800/50 border-white/5 text-slate-500 active:bg-slate-700"}`}>
            {group.label}
          </button>
        ))}
      </div>
      <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
        <div className="flex flex-wrap gap-1.5">
          {prefs.map((pref) => (
            <span key={pref} className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${deferredSearch && pref.startsWith(deferredSearch.replace(/[都道府県]$/, "")) ? "bg-cyan-500 text-white border-cyan-400" : "bg-slate-800/40 text-slate-600 border-white/5"}`}>
              {pref}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
});
