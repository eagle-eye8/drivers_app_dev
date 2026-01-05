import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { token } = await req.json();

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return NextResponse.json({ message: "session set" });
}
