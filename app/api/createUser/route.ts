import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, email } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    // Firestore users/{uid} に登録
    await adminDb.collection("users").doc(uid).set(
      {
        email,
        createdAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
