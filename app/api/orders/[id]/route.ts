import { adminDb } from "@/lib/firebaseAdmin";
import { calculateItemFee } from "@/lib/utils/calculateItemFee";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    if (date) query = query.where("reservationDate", "==", date);
    if (status) query = query.where("status", "==", status);

    const ordersSnap = await query.orderBy("createdAt", "desc").get();

    /* ===== 担当者IDs ===== */
    const employeeIds = Array.from(new Set(ordersSnap.docs.map((d) => d.data().assignedUid).filter(Boolean)));

    const employeesMap = new Map<string, any>();

    if (employeeIds.length > 0) {
      const employeeSnaps = await adminDb.getAll(...employeeIds.map((id) => adminDb.collection("employees").doc(id)));

      employeeSnaps.forEach((snap) => {
        if (snap.exists) employeesMap.set(snap.id, snap.data());
      });
    }

    /* ===== customers ===== */
    const customerIds = Array.from(new Set(ordersSnap.docs.map((d) => d.data().customerId).filter(Boolean)));

    const customersMap = new Map<string, any>();

    if (customerIds.length > 0) {
      const customerSnaps = await adminDb.getAll(...customerIds.map((id) => adminDb.collection("customers").doc(id)));

      customerSnaps.forEach((snap) => {
        if (snap.exists) customersMap.set(snap.id, snap.data());
      });
    }

    /* ===== join ===== */
    const orders: OrderWithCustomer[] = ordersSnap.docs.map((doc) => {
      const data = doc.data() as any;

      const customer = data.customerId ? customersMap.get(data.customerId) : null;

      const employee = data.assignedUid ? employeesMap.get(data.assignedUid) : null;

      return {
        id: doc.id,
        ...data,
        customer: customer
          ? {
              id: data.customerId,
              name: customer.name,
              address: customer.address,
              location: customer.location,
            }
          : null,
        assignedEmployee: employee
          ? {
              id: data.assignedUid,
              name: employee.name,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 🔹 担当者更新
    if ("assignedUid" in body) {
      await adminDb.collection("orders").doc(id).update({
        assignedUid: body.assignedUid,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    const items: OrderItem[] = body.items;

    if (!id || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    if ("items" in body) {
      const items: OrderItem[] = body.items;

      const priceVersion = "v2025_01";
      const itemPricings = items.map((item) => calculateItemFee(item, priceVersion));

      const totalAmount = itemPricings.reduce((sum, p) => sum + p.subtotal, 0);

      await adminDb.collection("orders").doc(id).update({
        items,
        priceVersion,
        amount: totalAmount,
        status: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
