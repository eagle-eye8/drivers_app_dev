import { adminDb } from "@/lib/firebaseAdmin";
import { geocodeAddress } from "@/lib/geocode";
import { Customer } from "@/types/customer";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, kana, address, email, phone } = body;

    const updateData: Partial<Customer> = {
      updatedAt: Timestamp.now(),
    };

    if (name) updateData.name = name;
    if (kana) updateData.kana = kana;
    if (address) {
      updateData.address = address;
      updateData.location = await geocodeAddress(address).catch(() => null);
    }
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    await adminDb.collection("customers").doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Patch Error:", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

// --- 削除処理 ---
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    console.log("id", id);
    if (!id) {
      return NextResponse.json({ error: "IDが指定されていません" }, { status: 400 });
    }

    // Firestoreからドキュメントを削除
    await adminDb.collection("customers").doc(id).delete();

    return NextResponse.json({ success: true, message: "削除が完了しました" });
  } catch (e) {
    console.error("Delete Error:", e);
    return NextResponse.json({ error: "削除処理中にエラーが発生しました" }, { status: 500 });
  }
}
