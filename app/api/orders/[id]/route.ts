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
    const uid = searchParams.get("uid");

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    if (date) query = query.where("reservationDate", "==", date);
    if (status) query = query.where("status", "==", status);
    if (uid) query = query.where("assignedEmployee.id", "==", uid);

    const ordersSnap = await query.orderBy("createdAt", "desc").get();

    /* ===== 担当者IDs ===== */
    const employeeIds = Array.from(new Set(ordersSnap.docs.map((d) => d.data().assignedEmployee?.id).filter(Boolean)));

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
        assignedEmployee: data.assignedEmployee,
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
    if ("assignedEmployee" in body) {
      await adminDb.collection("orders").doc(id).update({
        assignedEmployee: body.assignedEmployee,
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

      const priceVersion = "v2026_01";
      const itemPricings = items.map((item) => calculateItemFee(item, priceVersion));

      const totalAmount = itemPricings.reduce((sum, p) => sum + p.subtotal, 0);
      const totalPostOfficeFee = itemPricings.reduce((sum, p) => sum + p.postOfficeSubtotal, 0);

      await adminDb.collection("orders").doc(id).update({
        items,
        priceVersion,
        amount: totalAmount,
        postOfficeFee: totalPostOfficeFee,
        status: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
