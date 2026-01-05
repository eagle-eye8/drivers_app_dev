import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type ReorderPayload = {
  id: string;
  deliveryOrder: number;
}[];

export async function PATCH(req: Request) {
  try {
    const body: ReorderPayload = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const batch = adminDb.batch();

    body.forEach(({ id, deliveryOrder }) => {
      const ref = adminDb.collection("orders").doc(id);
      batch.update(ref, {
        deliveryOrder,
        updatedAt: new Date(),
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/orders/reorder error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
