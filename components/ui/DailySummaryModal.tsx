"use client";

import { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, Fuel, Receipt, Wallet, Info } from "lucide-react";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Order } from "@/types/order";
import { getJstDateString } from "@/lib/utils/date";

interface DailySummaryModalProps {
  onClose: () => void;
  isAdmin: boolean;
  uid?: string;
  orders: OrderWithCustomer[];
}

export default function DailySummaryModal({ onClose, isAdmin, uid, orders }: DailySummaryModalProps) {
  const today = getJstDateString();
  const [expensesData, setExpensesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. 経費データの取得 (API)
  useEffect(() => {
    const fetchExpenses = async () => {
      // uidがない場合はリクエストをスキップ
      if (!uid) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          date: today,
          userId: uid,
        });

        const res = await fetch(`/api/daily-reports?${params.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setExpensesData(data.data);
        } else {
          setExpensesData([]);
        }
      } catch (err) {
        setExpensesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [today, uid]); // 日付切り替えやユーザー変更で再実行
  // 2. 計算ロジック
  const summary = useMemo(() => {
    // 完了済みのオーダーのみ対象
    const completedOrders = orders?.filter((o) => o.status === "completed");

    let totalSales = 0; // 顧客請求額合計
    let totalPostOfficeFee = 0; // 郵便局支払額合計
    let totalItems = 0; // 個数合計

    const completedCount = completedOrders?.length;
    if (completedCount) {
      completedOrders?.forEach((order) => {
        const items = (order as Order).items || [];
        totalSales += order.amount || 0;
        totalPostOfficeFee += order.postOfficeFee || 0;
        totalItems += items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      });
    }
    // 経費合計の算出
    const totalExpenses = Array.isArray(expensesData) ? expensesData.reduce((sum, report) => sum + (report.totalExpense || 0), 0) : 0;

    // 個人利益 = 売上 - 原価(郵便局) - 経費
    // const netProfit = totalSales - totalPostOfficeFee - totalExpenses;
    // 現状経費だけを引いた金額が欲しいと希望あるため以下の処理
    const netProfit = totalSales - totalExpenses;

    return { totalSales, totalPostOfficeFee, totalItems, totalExpenses, netProfit, completedCount: completedCount };
  }, [orders, expensesData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-50 w-full h-full md:h-[90vh] md:max-w-lg md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl text-white ${isAdmin ? "bg-indigo-600" : "bg-blue-600"}`}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tighter">{isAdmin ? "全従業員集計" : "個人集計"}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{today}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {/* Main Net Profit Card */}
          <div className="p-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet size={120} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">最終利益 (手残り)</p>
              <h3 className="text-5xl font-black italic tracking-tighter mb-4">¥{summary.netProfit.toLocaleString()}</h3>
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

          {/* Detailed Breakdown Grid */}
          <div className="grid grid-cols-1 gap-4 px-6">
            {/* 売上 */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">総売上 (顧客請求)</p>
                  <p className="text-xl font-black text-slate-800">¥{summary.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 経費 */}
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
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-600"></div>}
            </div>
          </div>

          {/* 経費の内訳表示 (あれば) */}
          {expensesData?.length > 0 && (
            <div className="mt-6 px-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">経費一覧</h4>
              <div className="space-y-2">
                {expensesData.map((report: any) =>
                  report.expenses?.map(
                    (e: any, i: number) =>
                      e.amount > 0 && (
                        <div key={`${report.id}-${i}`} className="flex justify-between items-center text-xs border-l-2 border-slate-200 pl-3 py-1">
                          <span className="text-slate-500 font-bold">
                            {e.category} {e.memo && `(${e.memo})`}
                          </span>
                          <span className="text-slate-700 font-black">¥{e.amount.toLocaleString()}</span>
                        </div>
                      ),
                  ),
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 px-6 pt-10">
            {/* 郵便局支払 (原価) */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <Receipt size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">郵便局支払額</p>
                  <p className="text-xl font-black text-slate-800">¥{summary.totalPostOfficeFee.toLocaleString()}</p>
                </div>
              </div>
              <div className="group relative">
                <Info size={16} className="text-slate-300 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-[10px] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">配送サイズごとの規定料金（特約運賃）の合計です。</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 text-sm">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
