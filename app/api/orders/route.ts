// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { jstMidnightFromDateString } from "@/lib/date";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD (JST)
    const status = searchParams.get("status");
    const uid = searchParams.get("uid"); // ★ 従業員IDを取得

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    // 日付での絞り込み
    if (date) {
      const from = new Date(`${date}T00:00:00+09:00`);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);
      query = query.where("reservationDate", ">=", Timestamp.fromDate(from))
                   .where("reservationDate", "<", Timestamp.fromDate(to));
    }

    // ステータスでの絞り込み
    if (status) {
      query = query.where("status", "==", status);
    }

    // ★ 従業員IDでの絞り込みを追加
    if (uid) {
      query = query.where("assignedUid", "==", uid);
    }

    // インデックス設定に合わせてソート（reservationDateとassignedUidを混ぜる場合は複合インデックスが必要になる場合があります）
    const snap = await query.orderBy("reservationDate", "asc").get();

    /* ======================
       customers join (バッチ取得)
    ====================== */
    const customerIds = Array.from(new Set(snap.docs.map((d) => d.data().customerId).filter(Boolean)));
    const customersMap = new Map<string, any>();

    if (customerIds.length > 0) {
      const customerSnaps = await adminDb.getAll(...customerIds.map((id) => adminDb.collection("customers").doc(id)));
      customerSnaps.forEach((c) => {
        if (c.exists) customersMap.set(c.id, c.data());
      });
    }

    /* ======================
       employees join (バッチ取得)
    ====================== */
    const employeeIds = Array.from(new Set(snap.docs.map((d) => d.data().assignedUid).filter(Boolean)));
    const employeesMap = new Map<string, any>();

    if (employeeIds.length > 0) {
      const employeeSnaps = await adminDb.getAll(...employeeIds.map((id) => adminDb.collection("employees").doc(id)));
      employeeSnaps.forEach((e) => {
        if (e.exists) employeesMap.set(e.id, e.data());
      });
    }

    /* ======================
       build response (マッピング)
    ====================== */
    const orders: OrderWithCustomer[] = snap.docs.map((doc) => {
      const data = doc.data();
      const customer = data.customerId ? customersMap.get(data.customerId) : null;
      const employee = data.assignedUid ? employeesMap.get(data.assignedUid) : null;

      return {
        id: doc.id,
        customerId: data.customerId,
        reservationDate: data.reservationDate,
        routeGroupId: data.routeGroupId,
        status: data.status,
        amount: data.amount ?? 0,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
        pickupWindow: data.pickupWindow,
        items: data.items || [],
        isMerged: data.isMerged,
        deliveryOrder: data.deliveryOrder ?? 0,
        createdAt: data.createdAt?.toMillis?.() ?? 0,
        updatedAt: data.updatedAt?.toMillis?.() ?? 0,
        customer: customer
          ? {
              id: data.customerId,
              name: customer.name,
              address: customer.address,
              location: customer.location ?? null,
              createdAt: customer.createdAt?.toMillis?.() ?? 0,
              updatedAt: customer.updatedAt?.toMillis?.() ?? 0,
            }
          : null,
        assignedEmployee: {
          id: data.assignedUid ?? null,
          name: employee?.name ?? null,
        },
      };
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (e) {
    console.error("GET /api/orders error:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { customerId, assignedUid, reservationDate, kind, quantity } = body;

    const routeGroupId = `${customerId}-${reservationDate}`;

    const reservationTs = Timestamp.fromDate(jstMidnightFromDateString(reservationDate));
    const order = {
      customerId,
      assignedUid: assignedUid || null,
      reservationDate: reservationTs,
      routeGroupId,
      status: assignedUid ? "assigned" : "pending",
      amount: 0,
      paymentStatus: "unpaid",
      items: [kind === "heavy" ? { kind, to: "tokyo", quantity } : { kind, to: "tokyo", size: 60, quantity }],
      isMerged: false,
      deliveryOrder: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("orders").add(order);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
