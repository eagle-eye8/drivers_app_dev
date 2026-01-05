"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Loader2, Map } from "lucide-react";
import { getOrdersWithCustomerData } from "@/lib/firestore/getOrdersWithCustomerData";
import { optimizeRoute } from "@/lib/optimize/routeOptimizer";
import { Timestamp } from "firebase/firestore";
import Button from "./ui/button";

export type Order = {
  id: string;
  customerId?: string;
  reservationDate?: Timestamp | string; // Firestore or string
  assignedUid?: string;

  customer: {
    name: string;
    address: string;
    phone?: string;
    note?: string;
    lat: number;
    lng: number;
  };

  optimizedIndex?: number; // ← 並び替えに必須
};

export default function OptimizedOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Firestoreから注文取得
  useEffect(() => {
    const fetchData = async () => {
      const data = await getOrdersWithCustomerData();
      setOrders(data);
    };
    fetchData();
  }, []);

  // 最適ルート生成
  const handleOptimize = async () => {
    setLoading(true);

    const coords = orders.map((o) => ({
      id: o.id,
      lat: o.customer.lat,
      lng: o.customer.lng,
    }));

    const result = await optimizeRoute(coords);

    // 結果の順番を orders に反映
    const updated = orders.map((o) => {
      const found = result.find((r) => r.id === o.id);
      return { ...o, optimizedIndex: found?.index ?? 9999 };
    });

    setOrders(updated);
    setLoading(false);
  };

  // 表示は optimizedIndex → reservationDate の順
  const sortedOrders = [...orders].sort((a, b) => {
    const ai = a.optimizedIndex ?? 9999;
    const bi = b.optimizedIndex ?? 9999;
    return ai - bi;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button className="rounded-2xl shadow px-6 py-2" onClick={handleOptimize} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "ルート最適化"}
        </Button>
      </div>

      <div className="grid gap-3">
        {sortedOrders.map((order) => (
          <Card key={order.id} className="rounded-2xl shadow">
            <CardContent className="p-4 space-y-1">
              <div className="text-xs text-gray-400">{order.optimizedIndex !== undefined ? `#${order.optimizedIndex + 1}` : "-"}</div>
              <div className="font-semibold text-lg">{order.customer.name}</div>
              <div className="text-sm">{order.customer.address}</div>
              <div className="text-xs text-gray-500">予約: {order.reservationDate?.toString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
