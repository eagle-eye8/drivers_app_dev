// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { DashboardEmployee } from "@/types/orderWithCustomer";
import { Order } from "@/types/order";
import { getJstDateKey, getJstMidnight } from "@/lib/date";
import { Employee } from "@/types/employee";

// --- 🔁 customers を 10 件ずつバッチで取得する関数（外に出す） ---
async function fetchCustomersInBatches(ids: string[], db: FirebaseFirestore.Firestore) {
  const result: Record<string, any> = {};

  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const snap = await db.collection("customers").where(FieldPath.documentId(), "in", chunk).get();
    snap.docs.forEach((doc) => {
      result[doc.id] = { id: doc.id, ...(doc.data() as any) };
    });
  }

  return result;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value; // __session か session か統一を確認

    // 1. 認証チェックは並列化できないが、デコードのみに留める
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(session); // verifySessionCookieより速い場合も

    const now = new Date();
    const todayKey = getJstDateKey(now);
    const fromTs = Timestamp.fromDate(getJstMidnight(todayKey));
    const toTs = Timestamp.fromDate(new Date(getJstMidnight(todayKey).getTime() + 24 * 60 * 60 * 1000));

    // 2. 【重要】データの並列取得（Promise.all）を使って待ち時間を短縮
    const [ordersSnap, empSnap] = await Promise.all([adminDb.collection("orders").where("reservationDate", ">=", fromTs).where("reservationDate", "<", toTs).get(), adminDb.collection("employees").where("isActive", "==", true).get()]);

    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
    const employees = empSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Employee);

    // 3. 必要な顧客IDだけを抽出して一括取得（全件取得は絶対にしない）
    const customerIds = [...new Set(orders.map((o) => o.customerId).filter(Boolean))];
    let customersMap: Record<string, any> = {};
    if (customerIds.length > 0) {
      customersMap = await fetchCustomersInBatches(customerIds, adminDb);
    }

    // 4. 1回のループで集計処理を完結させる
    const orderStatsByEmployee = new Map<string, { assigned: number; completed: number }>();
    let totalAmount = 0;
    let pendingCount = 0;

    const todayOrders = orders.map((o) => {
      totalAmount += o.amount || 0;
      if (o.status === "pending") pendingCount++;

      // スタッフ集計
      const uid = o.assignedUid;
      if (uid) {
        const stats = orderStatsByEmployee.get(uid) || { assigned: 0, completed: 0 };
        stats.assigned++;
        if (o.status === "completed") stats.completed++;
        orderStatsByEmployee.set(uid, stats);
      }

      return {
        ...o,
        customer: customersMap[o.customerId] || { name: "不明な顧客" },
      };
    });

    const dashboardEmployees = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      assignedOrderCount: orderStatsByEmployee.get(emp.id)?.assigned || 0,
      completedOrderCount: orderStatsByEmployee.get(emp.id)?.completed || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        todayOrders,
        employees: dashboardEmployees,
        kpi: { orderCount: todayOrders.length, totalAmount, pendingCount },
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
