// scripts/seedOrders.cjs
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedOrders() {
  const dummyOrders = [
    { orderId: "ORDER-001", customerName: "山田太郎", from: "東京", to: "大阪", quantity: 3, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-002", customerName: "佐藤花子", from: "東京", to: "名古屋", quantity: 5, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-003", customerName: "鈴木一郎", from: "神奈川", to: "大阪", quantity: 2, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-004", customerName: "田中美咲", from: "千葉", to: "東京", quantity: 4, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-005", customerName: "高橋健", from: "東京", to: "大阪", quantity: 1, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-006", customerName: "小林優", from: "埼玉", to: "名古屋", quantity: 6, status: "requested", createdAt: new Date() },
    { orderId: "ORDER-007", customerName: "松本亮", from: "東京", to: "福岡", quantity: 3, status: "requested", createdAt: new Date() },
  ];

  for (const order of dummyOrders) {
    await db.collection("orders").add(order);
  }

  console.log("✓ Dummy orders inserted successfully!");
}

seedOrders().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
