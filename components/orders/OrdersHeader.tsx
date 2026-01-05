import { ORDER_STATUS_META, OrderStatus } from "@/lib/orderStatus";

type Props = {
  date: string;
  status: OrderStatus | "all";
  search: string;
  view: "table" | "card";
  onDateChange: (v: string) => void;
  onStatusChange: (v: OrderStatus | "all") => void;
  onSearchChange: (v: string) => void;
  onViewChange: (v: "table" | "card") => void;
};

export default function OrdersHeader({
  date,
  status,
  search,
  view,
  onDateChange,
  onStatusChange,
  onSearchChange,
  onViewChange,
}: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">注文一覧</h1>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">すべて</option>
            {Object.entries(ORDER_STATUS_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="顧客名で検索"
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewChange("table")}
            className={`px-3 py-2 rounded-lg text-sm border ${
              view === "table" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            テーブル
          </button>
          <button
            onClick={() => onViewChange("card")}
            className={`px-3 py-2 rounded-lg text-sm border ${
              view === "card" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            カード
          </button>
        </div>
      </div>
    </div>
  );
}
