import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function verifySession(session: string) {
  // ① セッション Cookie を検証
  const decoded = await adminAuth.verifySessionCookie(session, true);

  // ② admin 判定（custom claims or Firestore）
  let admin = false;

  // ▼ パターンA：custom claims を使っている場合
  if (decoded.admin === true) {
    admin = true;
  }

  // ▼ パターンB：Firestore users コレクションを見る場合（必要なら）
  // const userSnap = await adminDb.collection("users").doc(decoded.uid).get();
  // admin = userSnap.exists && userSnap.data()?.role === "admin";

  return {
    uid: decoded.uid,
    email: decoded.email,
    admin,
  };
}
