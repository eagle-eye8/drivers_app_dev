import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// JSONファイルを読み込む（ESMでの安全な読み込み方）
const serviceAccountPath = './serviceAccountKey.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "spilit"
});

const uid = "yc8laqpjUHPVY3eLF19nnXfjoft1";

async function setAdminClaim() {
  try {
    // カスタムクレームを設定
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ ユーザー ${uid} に admin 権限を付与しました。`);
    
    // 確認
    const user = await admin.auth().getUser(uid);
    console.log('現在のカスタムクレーム:', user.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

setAdminClaim();
