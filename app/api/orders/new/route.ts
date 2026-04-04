// app/api/orders/new/route.ts
import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { customerId, assignedEmployee, reservationDate, notes, items, amount } = body;

    const data = {
      customerId,
      assignedEmployee: assignedEmployee ?? null,
      reservationDate,
      notes: notes ?? "",
      amount,
      paymentStatus: "unpaid",
      status: assignedEmployee.id ? "assigned" : "pending",
      items,
      isMerged: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), data);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
