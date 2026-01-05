import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/verifySession";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/signin");
  }

  const user = await verifySession(session);

  if (user.admin) {
    redirect("/admin/dashboard");
  }

  redirect(`/orders/${user.uid}`);
}
