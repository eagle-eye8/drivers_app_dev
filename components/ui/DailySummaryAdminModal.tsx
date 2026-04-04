"use client";

import { AdminUserSummary, useAllUsersSummary } from "@/hooks/useDailySummary";
import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Banknote, ChartNoAxesCombined, ChevronDown, Fuel, Package, Receipt, TrendingUp, User, X } from "lucide-react";
import { useState } from "react";

interface DailySummaryAdminModalProps {
  onClose: () => void;
  orders: OrderWithCustomer[];
}

function EmployeeAccordion({ summary, isExpensesLoading }: { summary: AdminUserSummary; isExpensesLoading: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border transition-all duration-300 rounded-[2rem] overflow-hidden bg-white ${isOpen ? "border-blue-200 shadow-lg shadow-blue-500/5 ring-4 ring-blue-500/5" : "border-slate-100 shadow-sm hover:border-blue-100"}`}>
      <button onClick={() => setIsOpen((prev) => !prev)} className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </div>
          <div className="text-left">
            <span className="block text-sm font-black text-slate-800 tracking-tight">{summary.userName}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{summary.completedCount}件の集荷完了</span>
          </div>
        </div>
        {!isOpen && (
          <div className="text-right">
            <span className={`text-lg font-black font-mono ${summary.netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>{`¥ ${summary.netProfit.toLocaleString()}`}</span>
          </div>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-5">
            <MetricCell icon={<User size={14} className="text-indigo-500" />} label="件数" value={`${summary.completedCount} 件`} />
            <MetricCell icon={<Package size={14} className="text-sky-500" />} label="個数" value={`${summary.totalItems} 個`} />
            <MetricCell icon={<TrendingUp size={14} className="text-emerald-500" />} label="売上額" value={`¥ ${summary.totalSales.toLocaleString()}`} />
            <MetricCell icon={<Fuel size={14} className="text-rose-500" />} label="経費" value={`¥ ${summary.totalExpenses.toLocaleString()}`} isLoading={isExpensesLoading} />
            <MetricCell icon={<Receipt size={14} className="text-orange-500" />} label="郵便局支払" value={`¥ ${summary.totalPostOfficeFee.toLocaleString()}`} isLoading={isExpensesLoading} />
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Banknote size={16} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">手残り確定額</span>
            </div>
            <span className={`text-2xl font-black italic font-mono ${summary.netProfit >= 0 ? "text-white" : "text-rose-400"}`}>¥ {summary.netProfit.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCell({ icon, label, value, isLoading = false, theme = "light" }: { icon: React.ReactNode; label: string; value: string; isLoading?: boolean; theme?: "light" | "dark" }) {
  const isDark = theme === "dark";

  return (
    <div className={`border transition-all ${isDark ? "bg-white/5 border-white/10 rounded-[1.8rem] px-5 py-5 hover:bg-white/10" : "bg-slate-50 border-slate-100 rounded-2xl px-4 py-4 hover:bg-white hover:shadow-sm"}`}>
      <div className={`flex items-center gap-2 mb-1.5 ${isDark ? "opacity-70" : "opacity-70"}`}>
        {icon}
        <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-300" : "text-slate-500"}`}>{label}</span>
      </div>
      {isLoading ? <div className={`h-5 w-20 rounded-full animate-pulse ${isDark ? "bg-white/10" : "bg-slate-200"}`} /> : <p className={`font-black font-mono tracking-tight ${isDark ? "text-xl text-white" : "text-sm text-slate-800"}`}>{value}</p>}
    </div>
  );
}

export default function DailySummaryAdminModal({ onClose, orders }: DailySummaryAdminModalProps) {
  const today = getJstDateString();
  const { summaries, isLoading, totalSales, totalPostOfficeFee, totalExpenses, totalNetProfit } = useAllUsersSummary(orders);

  const totalCompletedCount = summaries.reduce((sum, s) => sum + s.completedCount, 0);
  const totalItems = summaries.reduce((sum, s) => sum + s.totalItems, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-50 w-full h-full md:h-[90vh] md:max-w-2xl md:rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="px-4 py-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-linear-to-br from-blue-600 to-indigo-300 p-3.5 rounded-[1.2rem] shadow-lg shadow-blue-500/40 border border-white/20">
                <ChartNoAxesCombined size={24} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tighter">本日の集計</h2>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-0.5">{today}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90 border border-slate-100">
            <X size={22} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6">
            <div className="relative bg-linear-to-b from-[#1590ed] to-[#0c60fa] rounded-[3.5rem] p-7 text-white shadow-2xl shadow-blue-900/30 overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
                  <p className="text-[11px] font-black text-blue-300 uppercase tracking-[0.4em]">集計額合計</p>
                </div>
                <div className="flex flex-col mb-3">
                  <div className="flex items-baseline gap-1 overflow-hidden">
                    <span className="text-4xl font-black text-blue-300italic tracking-tighter mr-2">¥</span>
                    <span className="text-5xl font-black tracking-tighter font-mono leading-none break-all drop-shadow-2xl text-white">{totalNetProfit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCell theme="dark" icon={<User size={16} className="text-indigo-400" />} label="件数" value={`${totalCompletedCount} 件`} isLoading={isLoading} />
                  <MetricCell theme="dark" icon={<Package size={16} className="text-sky-400" />} label="個数" value={`${totalItems} 個`} isLoading={isLoading} />
                  <MetricCell theme="dark" icon={<TrendingUp size={16} className="text-emerald-400" />} label="売上" value={`¥ ${totalSales.toLocaleString()}`} isLoading={isLoading} />
                  <MetricCell theme="dark" icon={<Fuel size={16} className="text-rose-400" />} label="経費" value={`¥ ${totalExpenses.toLocaleString()}`} isLoading={isLoading} />
                  <MetricCell theme="dark" icon={<Fuel size={16} className="text-rose-400" />} label="郵便局支払" value={`¥ ${totalPostOfficeFee.toLocaleString()}`} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 space-y-4">
            <div className="flex justify-between items-center px-2">{summaries.length > 0 && <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">集荷終了メンバー ({summaries.length}名)</span>}</div>
            {summaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Package size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 text-sm font-bold tracking-tight">本日の完了データはまだありません</p>
              </div>
            ) : (
              summaries.map((s) => <EmployeeAccordion key={s.userId} summary={s} isExpensesLoading={isLoading} />)
            )}
          </div>
        </div>
        <div className="p-8 bg-white border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black tracking-[0.2em] hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.97] transition-all shadow-lg shadow-blue-500/10 text-sm flex items-center justify-center gap-2">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
