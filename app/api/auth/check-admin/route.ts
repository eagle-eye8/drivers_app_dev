import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  // ⭐ await が必須の環境になっている
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) {
    return NextResponse.json({ admin: false }, { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return NextResponse.json({
      admin: decoded.admin === true,
      uid: decoded.uid,
    });
  } catch (err) {
    console.error("check-admin error:", err);
    return NextResponse.json({ admin: false }, { status: 401 });
  }
}
