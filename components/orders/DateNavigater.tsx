// components/orders/DateNavigator.tsx
"use client";

import { getJstDateString } from "@/lib/utils/date";

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
    <div className="flex justify-center">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2 shadow-sm">
        {/* 前日 */}
        <button onClick={() => shift(-1)} className="h-9 w-9 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100 active:scale-95 transition" aria-label="前日">
          ←
        </button>

        {/* 日付表示 */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-sm text-gray-500">{isToday ? "Today" : "Delivery Date"}</span>
          <span className="text-base font-semibold text-gray-800 tracking-wide">{date}</span>
        </div>

        {/* 翌日 */}
        <button onClick={() => shift(1)} className="h-9 w-9 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100 active:scale-95 transition" aria-label="翌日">
          →
        </button>
      </div>
    </div>
  );
}
