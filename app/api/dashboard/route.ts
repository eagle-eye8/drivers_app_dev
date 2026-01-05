// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { DashboardEmployee } from "@/types/orderWithCustomer";
import { Order } from "@/types/order";

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

// JST YYYY-MM-DD
function getJstDateKey(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  })
    .format(date)
    .replace(/\//g, "-");
}

// JST 0:00 Date
function getJstMidnight(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00+09:00`);
}

export async function GET() {
  try {
    // --- 🔐 Session ---
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(session, true);
    } catch (e) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- 📅 JST 日付計算 ---
    // --- JST 今日 ---
    const now = new Date();
    const todayKey = getJstDateKey(now); // "2026-01-03"

    // JST 0:00
    const fromDate = getJstMidnight(todayKey); // 2026-01-03T00:00:00+09:00

    // JST 翌日 0:00
    const toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 1);

    // Timestamp に変換
    const fromTs = Timestamp.fromDate(fromDate);
    const toTs = Timestamp.fromDate(toDate);

    // --- 🔍 Orders 取得 ---
    const ordersSnap = await adminDb.collection("orders").where("reservationDate", ">=", fromTs).where("reservationDate", "<", toTs).get();

    const orders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    // --- 📊 集計 ---
    const dateToCustomerSet: Record<string, Set<string>> = {};
    const amountByDate: Record<string, number> = {};
    const countByAssigned: Record<string, number> = {};

    for (const o of orders) {
      const date = getJstDateKey(o.reservationDate.toDate());

      if (!dateToCustomerSet[date]) dateToCustomerSet[date] = new Set();
      if (o.customerId) dateToCustomerSet[date].add(o.customerId);

      amountByDate[date] = (amountByDate[date] || 0) + (o.amount || 0);
      const uid = o.assignedUid || "unassigned";
      countByAssigned[uid] = (countByAssigned[uid] || 0) + 1;
    }

    const uniqueCustomersByDate: Record<string, number> = {};
    Object.keys(dateToCustomerSet).forEach((d) => {
      uniqueCustomersByDate[d] = dateToCustomerSet[d].size;
    });

    // --- 📅 今日の Orders ---
    const todayOrdersRaw: Order[] = orders.filter((o) => getJstDateKey(o.reservationDate.toDate()) === todayKey);

    // --- 🔁 customers を 10 件ずつ取得 ---
    const customerSnaps = await adminDb.collection("customers").get();

    const customers = customerSnaps.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    const customerIds = Array.from(new Set(todayOrdersRaw.map((o) => o.customerId).filter(Boolean)));

    let customersMap: Record<string, any> = {};
    if (customerIds.length > 0) {
      customersMap = await fetchCustomersInBatches(customerIds, adminDb);
    }

    const todayOrders = todayOrdersRaw.map((o) => ({
      ...o,
      customer: customersMap[o.customerId] || null,
    }));

    // --- 📊 KPI 計算（今日分） ---
    const orderCount = todayOrders.length;

    const totalAmount = todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // pending の定義は status が "pending" or "new" 等に合わせて
    const pendingCount = todayOrders.filter((o) => o.status === "pending").length;

    // --- 👥 employees ---
    const empSnap = await adminDb.collection("employees").where("active", "==", true).get();

    const employees = empSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    const orderCountByEmployee = new Map<string, number>();

    todayOrders.forEach((order) => {
      const emp = order.assignedUid;
      if (!emp) return;
      orderCountByEmployee.set(emp, (orderCountByEmployee.get(emp) ?? 0) + 1);
    });

    const dashboardEmployees: DashboardEmployee[] = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      assignedOrderCount: orderCountByEmployee.get(emp.id) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        todayOrders,
        employees: dashboardEmployees,
        customers,
        kpi: {
          orderCount,
          totalAmount,
          pendingCount,
        },
      },
    });
  } catch (err) {
    console.error("dashboard API error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
