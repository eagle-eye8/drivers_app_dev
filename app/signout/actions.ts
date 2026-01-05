"use server";

import router from "next/router";

export async function logoutAction() {
  await fetch("/api/auth/logout", { method: "POST" });
  router.replace("/signin");
}
