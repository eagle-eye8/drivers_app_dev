// app/api/orders/new/route.ts
import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { customerId, assignedUid, reservationDate, notes, pickupWindow, items, amount } = body;

    // routeGroupId 自動生成（日付 + 顧客ID）
    const routeGroupId = `${customerId}-${reservationDate}`;

    const data = {
      customerId,
      assignedUid: assignedUid ?? null,
      reservationDate,
      notes: notes ?? "",
      pickupWindow: pickupWindow ?? null,
      amount,
      paymentStatus: "unpaid",
      status: assignedUid ? "assigned" : "pending",
      items,
      isMerged: true,
      routeGroupId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), data);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("注文作成エラー:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
