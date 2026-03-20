// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // AuthorizationヘッダーからBearerトークン取得
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // adminAuthでトークン検証（クライアントSDKの状態に依存しない）
    const decoded = await adminAuth.verifyIdToken(token);

    const snap = await adminDb.collection("employees").doc(decoded.uid).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = snap.data()!;

    return NextResponse.json({
      user: {
        id: decoded.uid,
        email: decoded.email ?? "",
        name: data.name ?? "",
        role: data.role ?? "driver",
      },
    });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
