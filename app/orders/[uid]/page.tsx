"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { Timestamp, query, collection, where, getDocs, doc, getDoc } from "firebase/firestore";
import { startOfDay, endOfDay } from "date-fns";
import { Info, Route } from "lucide-react";
import { solveTSP, makeGoogleMapRoute } from "@/lib/tsp";
import { geocodeAddress } from "@/lib/geocode";

type Order = {
  id: string;
  title: string;
  status: string;
  reservationDate: Timestamp;
  customerId: string;
  assignedUid: string;
};

type Customer = {
  name: string;
  address: string;
  phone?: string;
  note?: string;
};

export default function OrdersPage() {
  const { uid } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [routeUrl, setRouteUrl] = useState<string>("");

  // -------------------------------------------
  // ① Firestoreから「今日の担当注文」を取得
  // -------------------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      if (!uid) return;

      try {
        const todayStart = Timestamp.fromDate(startOfDay(new Date()));
        const todayEnd = Timestamp.fromDate(endOfDay(new Date()));

        const q = query(collection(db, "orders"), where("assignedUid", "==", uid), where("reservationDate", ">=", todayStart), where("reservationDate", "<=", todayEnd));

        const snapshot = await getDocs(q);

        const list: Order[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setOrders(list);

        // -------------------------------------------
        // ② 顧客データ(customerIdの一覧)をまとめて取得
        // -------------------------------------------
        const customerMap: Record<string, Customer> = {};
        for (const order of list) {
          if (!order.customerId) continue;

          const ref = doc(db, "customers", order.customerId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            customerMap[order.customerId] = snap.data() as Customer;
          }
        }
        setCustomers(customerMap);
      } catch (error) {
        console.error("注文取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [uid]);

  // -------------------------------------------
  // ③ 最適ルート生成
  // -------------------------------------------
  const handleGenerateRoute = async () => {
    const customerList = orders.map((order) => customers[order.customerId]).filter(Boolean);

    if (customerList.length === 0) return;

    // 住所 → 緯度経度
    const points = [];
    for (const c of customerList) {
      const geo = await geocodeAddress(c.address);
      if (!geo) continue;

      points.push({
        lat: geo.lat,
        lng: geo.lng,
        label: c.address,
      });
    }

    // TSP（最適ルート計算）
    const sorted = solveTSP(points);

    // GoogleMap URL生成
    const url = makeGoogleMapRoute(sorted);

    setRouteUrl(url);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">今日の担当注文</h1>

      {/* --------------------- */}
      {/* 最適ルート作成ボタン */}
      {/* --------------------- */}
      <button onClick={handleGenerateRoute} className="w-full bg-black text-white py-3 rounded-xl hover:bg-black/80 flex items-center justify-center gap-2 mb-6">
        <Route className="w-5 h-5" />
        最適ルートを作成
      </button>

      {routeUrl && (
        <a href={routeUrl} target="_blank" className="block text-center text-blue-600 underline mb-8">
          Google Mapでルートを開く
        </a>
      )}

      {/* --------------------- */}
      {/* 注文一覧 */}
      {/* --------------------- */}
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">本日の予約はありません。</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const c = customers[order.customerId];
            return (
              <div key={order.id} className="p-4 rounded-lg shadow bg-white relative">
                <p className="font-semibold">{c?.name ?? "不明な顧客"}</p>
                <p className="text-sm text-gray-500">{c?.address}</p>
                <p className="text-sm text-gray-500">ステータス: {order.status}</p>

                {/* infoボタン */}
                <details className="mt-2">
                  <summary className="flex items-center gap-1 cursor-pointer text-gray-600 hover:text-black">
                    <Info className="w-4 h-4" />
                    詳細を見る
                  </summary>
                  <div className="mt-2 pl-6 text-sm">
                    <p>電話番号: {c?.phone ?? "なし"}</p>
                    <p>メモ: {c?.note ?? "なし"}</p>
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
