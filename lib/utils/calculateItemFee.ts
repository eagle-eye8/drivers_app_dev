import { PRICE_TABLES, PriceTableVersion } from "../constants/priceTable/v2025_01";

export function calculateItemFee(item: OrderItem, version: PriceTableVersion) {
  const table = PRICE_TABLES[version].prefectures[item.to];

  if (item.kind === 'heavy') {
    const unitPrice = table.heavyFee;
    return {
      unitPrice,
      subtotal: unitPrice * item.quantity
    };
  }

  if (item.kind === 'normal') {
    const unitPrice = table.normal.prices[item.size];
    return {
      unitPrice,
      subtotal: unitPrice * item.quantity
    };
  }

  // item.kind === 'chilled'
  const unitPrice = table.chilled.prices[item.size];
  return {
    unitPrice,
    subtotal: unitPrice * item.quantity
  };
}
