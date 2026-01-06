// app/api/auth/set-session/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const { token } = await req.json();

  const sessionCookie = await adminAuth.createSessionCookie(token, {
    expiresIn: 1000 * 60 * 60 * 24 * 5, // 5日
  });

  const res = NextResponse.json({ ok: true });

  res.cookies.set("__session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ★重要
    sameSite: "lax", // ★重要
    path: "/", // ★重要
    maxAge: 60 * 60 * 24 * 5,
  });

  return res;
}
