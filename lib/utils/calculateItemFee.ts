// lib/utils/calculateItemFee.ts

import { AREA_GROUPS, PRICE_TABLES } from "../constants/priceTable/v2026_01";

export function calculateItemFee(item: any, version: string = "v2026_01") {
  const tableData = (PRICE_TABLES as any)[version];
  if (!tableData) throw new Error(`Price table ${version} not found`);

  // 1. item.to が「グループ名」か「都道府県名」かを確認して代表県を特定する
  let targetPref = item.to;

  // AREA_GROUPS の label から逆引き
  const group = Object.values(AREA_GROUPS).find((g) => g.label === item.to);
  if (group) {
    // グループが見つかったら、そのグループの最初の県を代表として料金を取得
    targetPref = group.prefs[0];
  }

  const prefTable = tableData.prefectures[targetPref];

  if (!prefTable) {
    console.error(`Table not found for: ${targetPref}`);
    return { unitPrice: 0, subtotal: 0 };
  }

// 料金計算
  if (item.kind === "heavy") {
    const unitPrice = prefTable.heavyFee || 0;
    return { unitPrice, subtotal: unitPrice * (item.quantity || 1) };
  }

  const type = item.kind === "chilled" ? "chilled" : "normal";
  const size = Number(item.size);
  
  // ★ 修正ポイント：そのサイズが料金表に存在するか厳密にチェック
  const prices = prefTable[type].prices;
  const unitPrice = prices[size];

  if (unitPrice === undefined) {
    console.warn(`料金が見つかりません: ${targetPref}, ${type}, ${size}cm`);
    // 0円で計算させないために、あえて非常に高い数値を入れるか、nullを返してUI側で「判定不能」と出す
    return { unitPrice: 0, subtotal: 0, error: true }; 
  }

  return {
    unitPrice,
    subtotal: unitPrice * (item.quantity || 1),
    error: false
  };
}
