import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/signin");
  }

  const decoded = await adminAuth.verifySessionCookie(session, true);

  if (!decoded.admin) {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
