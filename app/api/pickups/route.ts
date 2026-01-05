import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type PickupItem = {
  to: string;
  pickupType: "normal" | "chilled";
  size: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customerName, items } = body as {
      orderId: string;
      customerName: string;
      items: PickupItem[];
    };

    if (!orderId || !items?.length) {
      return NextResponse.json({ success: false, error: "orderId or items missing" }, { status: 400 });
    }

    const now = new Date();

    // pickups コレクションに追加
    await adminDb.collection("pickups").add({
      orderId,
      customerName,
      items,
      status: "completed",
      createdAt: now,
      updatedAt: now,
    });

    // orders のステータス更新
    await adminDb.collection("orders").doc(orderId).update({
      status: "completed",
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/pickups error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
