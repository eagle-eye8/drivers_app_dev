"use client";

import { useCurrentSummary, useUserSummaries } from "@/hooks/useDailySummary";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { BadgeJapaneseYen, Fuel, TrendingUp, X } from "lucide-react";

interface DailySummaryModalProps {
  onClose: () => void;
  uid: string;
  orders: OrderWithCustomer[];
}

export default function DailySummaryModal({ onClose, uid, orders }: DailySummaryModalProps) {
  const today = getJstDateString();
  const userSummaries = useUserSummaries(orders);
  const { summary, reports: expensesData, isLoading } = useCurrentSummary(userSummaries, uid, orders);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-50 w-full h-full md:h-[90vh] md:max-w-lg md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 bg-white border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl text-white bg-blue-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tighter">個人集計</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{today}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-10">
          <div className="p-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BadgeJapaneseYen size={100}/>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">最終利益 (手残り)</p>
              <h3 className="text-5xl font-black italic tracking-tighter mb-4">¥ {summary.netProfit.toLocaleString()}</h3>
              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                  <p className="text-[9px] text-slate-400 uppercase font-black">集荷完了</p>
                  <p className="font-bold">
                    {summary.completedCount}件 / {summary.totalItems}個
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* 売上・経費カード */}
          <div className="grid grid-cols-1 gap-4 px-6">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">総売上 (顧客請求)</p>
                <p className="text-xl font-black text-slate-800">¥{summary.totalSales.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <Fuel size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">経費 (ガソリン/他)</p>
                  <p className="text-xl font-black text-slate-800">¥{summary.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-600" />}
            </div>
          </div>

          {/* 経費内訳 */}
          {expensesData.length > 0 && (
            <div className="mt-6 px-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">経費内訳</h4>
              <div className="space-y-2">
                {expensesData.map((report) =>
                  report.expenses?.map(
                    (e, i) =>
                      e.amount > 0 && (
                        <div key={`${report.id ?? i}-${i}`} className="flex justify-between items-center text-xs border-l-2 border-slate-200 pl-3 py-1">
                          <span className="text-slate-500 font-bold">
                            {e.category}
                            {e.memo && ` (${e.memo})`}
                          </span>
                          <span className="text-slate-700 font-black">¥{e.amount.toLocaleString()}</span>
                        </div>
                      ),
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 text-sm">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
