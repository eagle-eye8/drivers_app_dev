// components/date/DateSelector.tsx
"use client";

type Props = {
  date: string;
  onChange: (date: string) => void;
};

export function DateSelector({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const d = new Date(date);

  function shift(days: number) {
    const next = new Date(d);
    next.setDate(d.getDate() + days);
    onChange(next.toISOString().slice(0, 10));
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shift(-1)} className="btn">
        ←
      </button>
      <input type="date" value={date} onChange={(e) => onChange(e.target.value)} className="border rounded px-2 py-1" />
      <button onClick={() => shift(1)} className="btn">
        →
      </button>
      <button onClick={() => onChange(new Date().toISOString().slice(0, 10))} className="btn">
        今日
      </button>
    </div>
  );
}
