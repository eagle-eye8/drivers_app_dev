import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5日
  const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

  // ⭐ 自分でレスポンスを作成
  const res = NextResponse.json({ ok: true });

  // ⭐ Response Cookies を使って保存する
  res.cookies.set({
    name: "__session",
    value: sessionCookie,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: expiresIn / 1000,
    path: "/",
  });

  return res;
}



