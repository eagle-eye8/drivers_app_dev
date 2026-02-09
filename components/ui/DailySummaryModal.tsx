"use client";

import { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, Fuel, Receipt, Wallet, Info, Users, User } from "lucide-react";
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
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 管理者用：現在表示中のユーザーID（初期値は自分のID、または最初の従業員）
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(uid);
  // 管理者用表示モード: 'all' (一覧) | 'individual' (個別)
  const [viewMode, setViewMode] = useState<"all" | "individual">(uid ? "all" : "individual");

  // --- 1. データ集計ロジック ---
  
  // 全ユーザー別の集計データを作成
  const userSummaries = useMemo(() => {
    const completedOrders = orders?.filter((o) => o.status === "completed") || [];
    const grouped: Record<string, any> = {};
    completedOrders.forEach((order) => {
      const userId = uid || "unknown";
      const userName = (order as any).user?.name || "不明なユーザー";
      
      if (!grouped[userId]) {
        grouped[userId] = {
          userId,
          userName,
          totalSales: 0,
          totalPostOfficeFee: 0,
          totalItems: 0,
          completedCount: 0,
        };
      }

      const items = (order as Order).items || [];
      grouped[userId].totalSales += order.amount || 0;
      grouped[userId].totalPostOfficeFee += order.postOfficeFee || 0;
      grouped[userId].totalItems += items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      grouped[userId].completedCount += 1;
    });

    return Object.values(grouped);
  }, [orders]);

  // 選択されたユーザー（または自分）の経費データを取得
  useEffect(() => {
    const targetUid = viewMode === "individual" ? selectedUserId : null;
    if (!targetUid) return;

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          date: today,
          userId: targetUid,
        });
        const res = await fetch(`/api/daily-reports?${params.toString()}`);
        const data = await res.json();
        setExpensesData(data.success && Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setExpensesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [today, selectedUserId, viewMode]);

  // 個別表示用の計算ロジック
  const currentSummary = useMemo(() => {
    const targetUser = userSummaries.find(u => u.userId === selectedUserId);
    const totalExpenses = expensesData.reduce((sum, report) => sum + (report.totalExpense || 0), 0);
    const totalSales = targetUser?.totalSales || 0;
    
    return {
      ...targetUser,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      totalSales: totalSales,
      totalPostOfficeFee: targetUser?.totalPostOfficeFee || 0,
      totalItems: targetUser?.totalItems || 0,
      completedCount: targetUser?.completedCount || 0
    };
  }, [userSummaries, selectedUserId, expensesData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-50 w-full h-full md:h-[90vh] md:max-w-lg md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl text-white ${isAdmin ? "bg-indigo-600" : "bg-blue-600"}`}>
                {viewMode === 'all' ? <Users size={24} /> : <TrendingUp size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tighter">
                  {isAdmin ? (viewMode === "all" ? "従業員別一覧" : "個別詳細") : "個人集計"}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{today}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* 管理者用タブ切り替え */}
          {isAdmin && (
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setViewMode("all")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "all" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
              >
                全員一覧
              </button>
              <button 
                onClick={() => setViewMode("individual")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "individual" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                disabled={!selectedUserId}
              >
                個別詳細
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {viewMode === "all" && isAdmin ? (
            /* --- 管理者：全員一覧表示 --- */
            <div className="p-6 space-y-4">
              {userSummaries.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-bold">本日の完了データはありません</div>
              ) : (
                userSummaries.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => {
                      setSelectedUserId(user.userId);
                      setViewMode("individual");
                    }}
                    className="w-full bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <User size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-800">{user.userName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{user.completedCount}件の配送完了</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black">売上合計</p>
                      <p className="text-lg font-black text-slate-800">¥{user.totalSales.toLocaleString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* --- 個別詳細表示 (既存のUIを拡張) --- */
            <>
              {/* 選択中のユーザー名表示 (管理者の場合のみ) */}
              {isAdmin && (
                <div className="px-8 pt-4">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black italic">
                    VIEWING: {currentSummary.userName}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">最終利益 (手残り)</p>
                  <h3 className="text-5xl font-black italic tracking-tighter mb-4">¥{currentSummary.netProfit.toLocaleString()}</h3>
                  <div className="flex gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <p className="text-[9px] text-slate-400 uppercase font-black">集荷完了</p>
                      <p className="font-bold">
                        {currentSummary.completedCount}件 / {currentSummary.totalItems}個
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase">総売上 (顧客請求)</p>
                      <p className="text-xl font-black text-slate-800">¥{currentSummary.totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                      <Fuel size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase">経費 (ガソリン/他)</p>
                      <p className="text-xl font-black text-slate-800">¥{currentSummary.totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                  {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-600"></div>}
                </div>
              </div>

              {expensesData.length > 0 && (
                <div className="mt-6 px-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">経費内訳</h4>
                  <div className="space-y-2">
                    {expensesData.map((report: any) =>
                      report.expenses?.map((e: any, i: number) => 
                        e.amount > 0 && (
                          <div key={`${report.id}-${i}`} className="flex justify-between items-center text-xs border-l-2 border-slate-200 pl-3 py-1">
                            <span className="text-slate-500 font-bold">{e.category} {e.memo && `(${e.memo})`}</span>
                            <span className="text-slate-700 font-black">¥{e.amount.toLocaleString()}</span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 px-6 pt-10">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase">郵便局支払額</p>
                      <p className="text-xl font-black text-slate-800">¥{currentSummary.totalPostOfficeFee.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="group relative">
                    <Info size={16} className="text-slate-300 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-[10px] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">配送サイズごとの規定料金の合計です。</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex gap-3">
          {viewMode === "individual" && isAdmin && (
            <button 
              onClick={() => setViewMode("all")}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-sm hover:bg-slate-200 transition-all"
            >
              一覧に戻る
            </button>
          )}
          <button 
            onClick={onClose} 
            className={`${viewMode === "individual" && isAdmin ? 'flex-1' : 'w-full'} py-5 bg-slate-900 text-white rounded-[1.5rem] font-black tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 text-sm`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
