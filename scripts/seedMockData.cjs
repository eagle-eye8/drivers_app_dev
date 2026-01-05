// seedMockData.cjs  ← 拡張子注意（CJSで動かす）
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

// -------------------------
// Firebase Admin 初期化
// -------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// -------------------------
// モック customers
// -------------------------
const customers = [
  {
    id: "c1",
    name: "佐藤商店",
    phone: "0172-11-1111",
    address: "青森県弘前市土手町100",
    note: "",
    location: { lat: 40.6035, lng: 140.4642 },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "c2",
    name: "田中酒店",
    phone: "0172-22-2222",
    address: "青森県弘前市駅前3-2",
    note: "",
    location: { lat: 40.6015, lng: 140.4638 },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

// -------------------------
// モック orders（3日分 × 各5件）
// -------------------------
const orders = [];

const pickupWindows = [1, 2, 3];

for (let day = 0; day < 3; day++) {
  const base = new Date();
  base.setDate(base.getDate() + day);

  for (let i = 0; i < 5; i++) {
    const customer = customers[i % customers.length];

    orders.push({
      customerId: customer.id,
      assignedUid: "",
      reservationDate: Timestamp.fromDate(base),
      status: "pending",
      amount: Math.floor(Math.random() * 4000 + 2000),

      items: [
        {
          to: customer.address,
          quantity: Math.floor(Math.random() * 3 + 1),
          pickupType: "normal",
          size: 120,
        },
      ],

      pickupWindow: pickupWindows[i % 3],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

// -------------------------
// Firestore に書き込み
// -------------------------
async function seed() {
  for (const c of customers) {
    await db.collection("customers").doc(c.id).set(c);
  }
  for (const o of orders) {
    await db.collection("orders").add(o);
  }
  process.exit(0);
}

seed();
