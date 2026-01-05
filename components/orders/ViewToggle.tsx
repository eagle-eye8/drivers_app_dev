// components/orders/ViewToggle.tsx
"use client";

export function ViewToggle({
  value,
  onChange,
}: {
  value: "card" | "table";
  onChange: (v: "card" | "table") => void;
}) {
  return (
    <div className="flex rounded-lg border overflow-hidden">
      <button
        onClick={() => onChange("card")}
        className={`px-3 py-1 text-sm ${
          value === "card" ? "bg-blue-600 text-white" : "bg-white"
        }`}
      >
        カード
      </button>
      <button
        onClick={() => onChange("table")}
        className={`px-3 py-1 text-sm ${
          value === "table" ? "bg-blue-600 text-white" : "bg-white"
        }`}
      >
        テーブル
      </button>
    </div>
  );
}
