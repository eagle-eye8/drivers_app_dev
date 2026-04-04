"use client";

import { getJstDateString } from "@/lib/utils/date";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Props = {
  date: string;
  onChange: (nextDate: string) => void;
};

export function DateNavigator({ date, onChange }: Props) {
  function shift(diff: number) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + diff);
    onChange(getJstDateString(d));
  }

  const today = getJstDateString();
  const isToday = date === today;

  return (
    <div className="flex justify-center my-6">
      <div className="relative flex items-center justify-center group">
        <div className="flex items-center bg-white p-1.5 rounded-[24px] shadow-xl shadow-blue-900/10 border border-slate-100 z-10">
          <button onClick={() => shift(-1)} className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 active:scale-90 transition-all">
            <ChevronLeft className="text-slate-400 group-hover:text-blue-600" size={24} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center px-8 border-x border-slate-100 min-w-[220px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar size={12} className={isToday ? "text-blue-500" : "text-slate-400"} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-blue-600" : "text-slate-400"}`}>{isToday ? "本日の注文" : "注文日付"}</span>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight font-mono whitespace-nowrap">{date.replace(/-/g, " / ")}</span>
          </div>
          <button onClick={() => shift(1)} className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 active:scale-90 transition-all">
            <ChevronRight className="text-slate-400 group-hover:text-blue-600" size={24} strokeWidth={2.5} />
          </button>
        </div>
        {!isToday && (
          <div className="absolute left-full ml-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button onClick={() => onChange(today)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 whitespace-nowrap">
              <RotateCcw size={14} strokeWidth={3} />
              <span className="text-[12px] font-bold">今日に戻る</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
