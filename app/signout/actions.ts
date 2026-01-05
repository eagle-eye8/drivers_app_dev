"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies(); // ← 必須！
  cookieStore.delete("__session");
}
