import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { ORDER_STATUS_META } from "@/lib/orderStatus";
import Link from "next/link";

export default function OrdersTable({ orders }: { orders: OrderWithCustomer[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">顧客</th>
            <th className="px-3 py-2">状態</th>
            <th className="px-3 py-2">金額</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">{o.customer?.name ?? "不明"}</td>
              <td className="px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_META[o.status].badgeClass}`}>
                  {ORDER_STATUS_META[o.status].label}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                ¥{o.amount.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right">
                <Link href={`/admin/orders/${o.id}`} className="text-blue-600 underline">
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
