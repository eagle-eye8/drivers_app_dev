// app/api/auth/set-session/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    // 1. まずトークンから ID を取得
    const decodedToken = await adminAuth.verifyIdToken(token);
    const id = decodedToken.id;

    // 2. 🔥 ここが重要！DBから最新のユーザー情報を直接取得する
    // これにより、さっき CLI で付与した admin: true が確実に反映された状態で取得できます
    const userRecord = await adminAuth.getUser(id);
    const isAdmin = userRecord.customClaims?.admin === true;

    // 3. セッションCookieを作成
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    const res = NextResponse.json({
      ok: true,
      admin: isAdmin, // 最新の情報を返す
      id: id,
    });

    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5,
    });

    return res;
  } catch (error) {
    console.error("SET_SESSION_ERROR:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
