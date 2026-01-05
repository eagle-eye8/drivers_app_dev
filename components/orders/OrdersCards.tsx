import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import Link from "next/link";

export default function OrdersCards({ orders }: { orders: OrderWithCustomer[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-xl border bg-white p-4 shadow space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold">{o.customer?.name ?? "不明な顧客"}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_META[o.status].badgeClass}`}>
              {ORDER_STATUS_META[o.status].label}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            ¥{o.amount.toLocaleString()}
          </div>

          <Link href={`/admin/orders/${o.id}`} className="text-sm text-blue-600 underline">
            詳細を見る
          </Link>
        </div>
      ))}
    </div>
  );
}
