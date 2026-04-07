import { getJstMidnight } from "@/lib/date";
import { adminDb } from "@/lib/firebaseAdmin";
import { getJstDateTimeString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

async function getSortedOrders(orders: OrderWithCustomer[]) {
  const incompleteOrders = orders.filter((o) => o.status !== "completed").sort((a, b) => (a.deliveryOrder ?? 0) - (b.deliveryOrder ?? 0));

  const completedOrders = orders.filter((o) => o.status === "completed");

  return [...incompleteOrders, ...completedOrders];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const id = searchParams.get("uid");

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    if (date) {
      const from = new Date(`${date}T00:00:00+09:00`);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);
      query = query.where("reservationDate", ">=", Timestamp.fromDate(from)).where("reservationDate", "<", Timestamp.fromDate(to));
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    if (id) {
      query = query.where("assignedEmployee.id", "==", id);
    }

    const snap = await query.orderBy("reservationDate", "asc").get();

    const customerIds = Array.from(new Set(snap.docs.map((d) => d.data().customerId).filter(Boolean)));
    const customersMap = new Map<string, any>();

    if (customerIds.length > 0) {
      const customerSnaps = await adminDb.getAll(...customerIds.map((id) => adminDb.collection("customers").doc(id as string)));
      customerSnaps.forEach((c) => {
        if (c.exists) customersMap.set(c.id, c.data());
      });
    }

    const orders: OrderWithCustomer[] = snap.docs.map((doc) => {
      const data = doc.data();
      const customer = data.customerId ? customersMap.get(data.customerId) : null;

      return {
        id: doc.id,
        customerId: data.customerId,
        assignedEmployee: data.assignedEmployee,
        reservationDate: data.reservationDate,
        status: data.status,
        amount: data.amount ?? 0,
        postOfficeFee: data.postOfficeFee,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
        items: data.items || [],
        isMerged: data.isMerged,
        deliveryOrder: data.deliveryOrder ?? 0,
        createdAt: data.createdAt?.toMillis?.() ?? 0,
        updatedAt: data.updatedAt?.toMillis?.() ?? 0,
        customer: customer
          ? {
              id: data.customerId,
              name: customer.name,
              kana: customer.kana,
              email: customer.email ?? "",
              searchIndex: customer.searchIndex ?? "",
              address: customer.address,
              phones: customer.phones || [],
              location: customer.location ?? null,
              createdAt: customer.createdAt ? getJstDateTimeString(customer.createdAt) : "---",
              updatedAt: customer.updatedAt ? getJstDateTimeString(customer.updatedAt) : "---",
            }
          : null,
      };
    });

    const finalData = await getSortedOrders(orders);

    return NextResponse.json({ success: true, data: finalData });
  } catch (e) {
    console.error("GET /api/orders error:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, reservationDate, assignedEmployee } = body;

    const reservationTs = Timestamp.fromDate(getJstMidnight(reservationDate));

    const order = {
      customerId,
      assignedEmployee,
      reservationDate: reservationTs,
      status: assignedEmployee?.id ? "assigned" : "pending",
      amount: 0,
      paymentStatus: "unpaid",
      isMerged: false,
      deliveryOrder: 999,
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
