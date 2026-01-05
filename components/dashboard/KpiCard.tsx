// components/dashboard/KpiCard.tsx
export function KpiCard({ title, value, icon, highlight }: any) {
  return (
    <div
      className={`border rounded-2xl p-6 bg-white shadow-sm
        ${highlight ? "border-red-400 bg-red-50" : ""}
      `}
    >
      <div className="text-gray-600">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-4 opacity-40">{icon}</div>
    </div>
  );
}
