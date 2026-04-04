"use client";

import { AlertCircle, Banknote, BarChart3, ChartNoAxesCombined, ChevronLeft, ChevronRight, ClipboardCheck, HandCoins, Loader2, Package, TrendingUp, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlyData {
  date: string;
  day: number;
  sales: number;
  profit: number;
  count: number;
  items: number;
}

interface MonthlyResponse {
  success: boolean;
  summary: {
    sales: number;
    profit: number;
    count: number;
    items: number;
  };
  dailyData: MonthlyData[];
}

export default function MonthlySummaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<MonthlyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          year: year.toString(),
          month: month.toString(),
        });
        const res = await fetch(`/api/monthly-summary?${params}`);
        if (!res.ok) throw new Error("データの取得に失敗しました");

        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          throw new Error(json.message || "集計データの取得に失敗しました");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlySummary();
  }, [year, month]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-rose-500 gap-2 p-4 text-center">
        <AlertCircle className="w-10 h-10" />
        <p className="font-black">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 underline text-sm">
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8 space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-blue-600 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <ChartNoAxesCombined strokeWidth={2.5} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">月次集計レポート</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">{year} Performance</p>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-start bg-slate-100 p-1 rounded-xl md:rounded-2xl border border-slate-200 w-full md:w-auto md:self-start self-center">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg md:rounded-xl transition-all active:scale-95 text-slate-500">
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="flex-1 md:flex-none md:px-8 text-center min-w-[100px] md:min-w-[140px]">
            <span className="block text-base md:text-lg font-black text-slate-800 font-mono tracking-tighter">
              {year} / {month}
            </span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg md:rounded-xl transition-all active:scale-95 text-slate-500">
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SummaryBadge label="合計件数" value={`${data?.summary.count ?? "---"}件`} icon={<ClipboardCheck className="w-5 h-5 text-indigo-500" />} isLoading={isLoading} />
        <SummaryBadge label="合計個数" value={`${data?.summary.items ?? "---"}個`} icon={<Package className="w-5 h-5 text-amber-500" />} isLoading={isLoading} />
        <SummaryBadge label="月間売上" value={`¥ ${data?.summary.sales.toLocaleString() ?? "---"}`} icon={<Banknote className="w-5 h-5 text-emerald-500" />} isLoading={isLoading} />
        <SummaryBadge label="月間利益" value={`¥ ${data?.summary.profit.toLocaleString() ?? "---"}`} icon={<TrendingUp className="w-5 h-5 text-blue-500" />} isLoading={isLoading} />
      </div>
      {/* 1. 日別詳細テーブル */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all">
        <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight">日別詳細ログ</h3>
          </div>
          {isLoading && <Loader2 className="animate-spin text-blue-500 w-5 h-5" />}
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[350px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">日付</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">件数</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">個数</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">売上</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">利益</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-slate-300 text-sm">
                    読み込み中...
                  </td>
                </tr>
              ) : (
                data?.dailyData.map((d) => (
                  <tr key={d.date} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 md:px-6 py-3 md:py-4 font-mono text-sm font-black text-slate-500">{d.day}日</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-bold text-slate-700 text-sm">{d.count}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-bold text-slate-700 text-sm">{d.items}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-black text-slate-800 font-mono text-sm">¥ {d.sales.toLocaleString()}</td>
                    <td className={`px-4 md:px-6 py-3 md:py-4 text-right font-black font-mono text-sm ${d.profit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>¥ {d.profit.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 2. ビジュアルチャート */}
      <div className="grid grid-cols-1 gap-6">
        {/* 1. お金のチャート（売上・利益） */}
        <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-5 md:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex gap-3 text-lg md:text-xl font-black tracking-tighter text-blue-400">
                <HandCoins />
                {`${"収益パフォーマンス"}`}
              </h3>
              <div className="flex gap-4">
                <LegendItem color="#3b82f6" label="売上" />
                <LegendItem color="#10b981" label="利益" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              {!isLoading && data && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.dailyData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "none" }} />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSales)" />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        {/* 2. 数量のチャート（件数・個数） */}
        <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-5 md:p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex gap-3 text-lg md:text-xl font-black tracking-tighter text-purple-400">
                <Truck />
                {`${"集荷数量"}`}
              </h3>
              <div className="flex gap-4">
                <LegendItem color="#8b5cf6" label="件数" />
                <LegendItem color="#f59e0b" label="個数" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              {!isLoading && data && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "none" }} />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="items" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, icon, isLoading }: { label: string; value: string; icon: React.ReactNode; isLoading: boolean }) {
  return (
    <div className="bg-white p-3 md:p-6 rounded-[1.2rem] md:rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center gap-2.5 md:gap-5 transition-all">
      <div className="p-2 md:p-4 bg-slate-50 rounded-lg md:rounded-[1.2rem] flex items-center justify-center">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter md:tracking-[0.15em] mb-0.5 truncate">{label}</p>
        {isLoading ? <div className="h-4 md:h-6 w-16 md:w-24 bg-slate-100 animate-pulse rounded-md" /> : <p className="text-sm md:text-2xl font-black text-slate-800 font-mono tracking-tighter truncate">{value}</p>}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-0.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}
