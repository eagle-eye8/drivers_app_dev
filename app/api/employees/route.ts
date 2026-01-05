// app/api/employees/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snap = await adminDb
      .collection("employees")
      .where("isActive", "==", true)
      .orderBy("name")
      .get();

    const employees = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (err) {
    console.error("GET /api/employees error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
