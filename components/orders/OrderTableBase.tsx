"use client";

import { useRouter } from "next/navigation";
import { OrderWithCustomer } from "@/types/orderWithCustomer";

type Props = {
  orders: OrderWithCustomer[];
  showStatus?: false;
};

export function OrderTableBase({ orders }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">注文者</th>
            <th className="px-3 py-2 text-left">住所</th>
            <th className="px-3 py-2 text-right">数量</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => router.push(`/pickups/new?orderId=${o.id}`)}>
              <td className="px-3 py-3">{o.customer?.name}</td>
              <td className="px-3 py-3 text-gray-600">{o.customer?.address}</td>
              <td className="px-3 py-3 text-right">{o.items?.reduce((sum, item) => sum + item.quantity, 0)}</td>

              {/* Google Maps */}
              {o.customer?.location && (
                <td
                  className="px-3 py-3 text-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    const { lat, lng } = o.customer?.location!;
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                    window.open(url, "_blank");
                  }}
                >
                  <button className="text-blue-600 underline text-xs">Map</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
