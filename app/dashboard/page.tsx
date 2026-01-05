"use client";

import { TrendingUp, ClipboardList, Users, CircleDollarSign, Info } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* --- KPI タイル --- */}
        <KpiCard title="今日の予約数" value="12" icon={<ClipboardList />} />
        <KpiCard title="未割り当て" value="3" icon={<Users />} />
        <KpiCard title="スタッフ数" value="4" icon={<Users />} />
        <KpiCard title="今日の売上" value="¥24,000" icon={<CircleDollarSign />} />

        {/* --- 注文一覧（内部スクロール） --- */}
        <Tile title="注文一覧" height="h-[350px]">
          <div className="space-y-3 overflow-y-auto pr-2">
            {[1, 2, 3].map((i) => (
              <OrderItem key={i} name={`お客様 ${i}`} address="東京都渋谷区" time="10:30" />
            ))}
          </div>
        </Tile>

        {/* --- スタッフ割り当て --- */}
        <Tile title="スタッフ割り当て" height="h-[350px]">
          <div className="space-y-3 overflow-y-auto pr-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-xl p-4 bg-white shadow-sm">
                <p className="font-semibold">スタッフ {i}</p>
                <p className="text-sm text-gray-600">担当: 3件</p>
              </div>
            ))}
          </div>
        </Tile>

        {/* --- 顧客詳細一覧（重要顧客など） --- */}
        <Tile title="顧客リスト" height="h-[350px]">
          <div className="space-y-3 overflow-y-auto pr-2">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-xl p-4 bg-white shadow-sm">
                <p className="font-semibold">お客様 {i}</p>
                <p className="text-sm text-gray-600">東京 / 090-1234-5678</p>
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </div>
  );
}

/* ---------------------------
   ここから UI コンポーネント
---------------------------- */

function KpiCard({ title, value, icon }: any) {
  return (
    <div className="border rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-3">
      <div className="text-gray-600">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-auto opacity-40">{icon}</div>
    </div>
  );
}

function Tile({ title, children, height }: any) {
  return (
    <div className="border rounded-2xl bg-white shadow-sm p-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-4 flex justify-between">{title}</h2>
      <div className={`${height} overflow-y-auto`}>{children}</div>
    </div>
  );
}

function OrderItem({ name, address, time }: any) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm flex justify-between items-start">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{address}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
      <Info className="w-5 h-5 text-gray-500" />
    </div>
  );
}
