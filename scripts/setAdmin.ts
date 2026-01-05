import "dotenv/config";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname を ESM で安全に作る
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 読み込み（require を使わず安全）
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
});

async function setAdmin() {
  const uid = "TI1HlGLq7RfxjQyqgRtMn8a46j13";
  await getAuth().setCustomUserClaims(uid, { admin: true });
}

setAdmin();
