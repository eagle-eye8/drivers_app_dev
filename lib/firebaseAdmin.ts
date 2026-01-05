// lib/firebaseAdmin.ts

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!privateKey || !clientEmail || !projectId) {
  throw new Error("Missing Firebase Admin environment variables (PRIVATE_KEY, CLIENT_EMAIL, PROJECT_ID).");
}

// 秘密鍵の改行を復元
// FIREBASE_PRIVATE_KEY内の \\n を \n に置換
const correctedPrivateKey = privateKey.replace(/\\n/g, "\n"); 

const serviceAccount = {
  type: "service_account",
  projectId: projectId,
  privateKey: correctedPrivateKey,
  clientEmail: clientEmail,
};

if (!getApps().length) {
  initializeApp({
    // JSON.parse() を使わず、直接サービスアカウントオブジェクトを渡す
    credential: cert(serviceAccount as any),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
