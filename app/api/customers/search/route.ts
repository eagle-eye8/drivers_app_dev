// app/api/customers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await adminAuth.verifyIdToken(session);

    // 入力値のハイフン・スペース除去（モーダル側でも除去済みだが念のため）
    const phone = req.nextUrl.searchParams.get("phone")?.replace(/[-\s]/g, "");
    if (!phone || phone.length < 4) {
      return NextResponse.json({ customer: null });
    }

    // phoneフィールドはハイフンなし統一運用なので直接比較
    const snap = await adminDb.collection("customers").where("phone", "==", phone).limit(1).get();

    if (snap.empty) {
      return NextResponse.json({ customer: null });
    }

    const doc = snap.docs[0];
    return NextResponse.json({
      customer: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
