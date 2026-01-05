// scripts/seedEmployees.cjs
// node scripts/seedEmployees.cjs
// seedMockData.cjs  ← 拡張子注意（CJSで動かす）
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const employees = [
  { id: "emp_driver_1", name: "山田 太郎", role: "driver", phone: "080-1000-0001", email: "yamada@example.com", active: true },
  { id: "emp_driver_2", name: "佐藤 花子", role: "driver", phone: "080-1000-0002", email: "sato@example.com", active: true },
  { id: "emp_driver_3", name: "鈴木 一郎", role: "driver", phone: "080-1000-0003", email: "suzuki@example.com", active: true },
  { id: "emp_admin_1", name: "高橋 次郎", role: "admin", phone: "080-1000-0004", email: "takahashi@example.com", active: true },
  { id: "emp_driver_4", name: "伊藤 美紀", role: "driver", phone: "080-1000-0005", email: "ito@example.com", active: true },
];

async function seed() {
  for (const e of employees) {
    await db.collection("employees").doc(e.id).set({
      name: e.name,
      role: e.role,
      phone: e.phone,
      email: e.email,
      active: e.active,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
