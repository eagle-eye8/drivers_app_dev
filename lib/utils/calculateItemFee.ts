// lib/utils/calculateItemFee.ts
import prices from "../constants/priceTable/shippingPrices.json";
import areaMapping from "../constants/priceTable/areaMapping.json";

// 型定義の整理
type KindType = "normal" | "chilled" | "heavy";

interface CalculationResult {
  unitPrice: number;        // 顧客請求単価
  postOfficeFee: number;    // 郵便局支払単価
  subtotal: number;         // 顧客請求小計
  postOfficeSubtotal: number; // 郵便局支払小計
  error: boolean;
  label: string;
}

/**
 * 荷物の条件から「顧客請求額」と「郵便局支払額」を同時に算出します。
 */
export function calculateItemFee(item: any, version: string = "v2026_01"): CalculationResult {
  const defaultResult: CalculationResult = {
    unitPrice: 0,
    postOfficeFee: 0,
    subtotal: 0,
    postOfficeSubtotal: 0,
    error: true,
    label: "不明",
  };

  // 1. バージョンチェック
  const versionData = (prices as any)[version];
  if (!versionData) {
    console.error(`Price table version ${version} not found`);
    return defaultResult;
  }

  // 2. 配送先グループの特定
  let groupId = (areaMapping as any)[item.to];

  if (!groupId) {
    if (versionData[item.to]) {
      groupId = item.to;
    } else {
      const foundGroupKey = Object.keys(versionData).find(
        (key) => versionData[key].label === item.to
      );
      groupId = foundGroupKey;
    }
  }

  const groupTable = versionData[groupId];
  if (!groupTable) {
    console.warn(`Table not found for area: ${item.to}`);
    return defaultResult;
  }

  const quantity = Number(item.quantity) || 0;
  let unitPrice = 0;
  let postOfficeFee = 0;

  // 3. 計算ロジック
  try {
    if (item.kind === "heavy") {
      // 重量物の場合
      unitPrice = groupTable.heavyFee?.customerPrice || 0;
      postOfficeFee = groupTable.heavyFee?.postOfficeFee || 0;
    } else {
      // 通常・チルドの場合
      const type = item.kind === "chilled" ? "chilled" : "normal";
      const sizeKey = String(item.size);
      const priceData = groupTable[type]?.[sizeKey];

      if (priceData) {
        unitPrice = priceData.customerPrice || 0;
        postOfficeFee = priceData.postOfficeFee || 0;
      } else {
        console.warn(`Price info missing for: ${groupId} > ${type} > ${sizeKey}`);
        return { ...defaultResult, label: groupTable.label };
      }
    }

    return {
      unitPrice,
      postOfficeFee,
      subtotal: unitPrice * quantity,
      postOfficeSubtotal: postOfficeFee * quantity,
      error: unitPrice === 0 || postOfficeFee === 0,
      label: groupTable.label,
    };
  } catch (e) {
    console.error("Calculation Error:", e);
    return defaultResult;
  }
}
