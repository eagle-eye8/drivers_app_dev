import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { token, uid, email, name } = await req.json();

  const cookieStore = await cookies();

  // ---------------------------
  // ① ID Token を HttpOnly cookie に保存
  // ---------------------------
  cookieStore.set("__session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });

  // ---------------------------
  // ② 非機密プロフィールを Cookie に保存（フロントでも読める）
  // ---------------------------
  cookieStore.set("uid", uid, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("email", email ?? "", {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("name", name ?? "", {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ message: "session set" });
}
