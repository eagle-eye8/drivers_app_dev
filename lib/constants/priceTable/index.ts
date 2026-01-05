import { PRICE_TABLES } from "./v2025_01";

export type PriceTableKey = keyof typeof PRICE_TABLES;

export const PRICE_TABLE_KEY_BY_LABEL: Record<string, PriceTableKey> = Object.fromEntries(Object.entries(PRICE_TABLES).map(([key, value]) => [value.label, key])) as Record<string, PriceTableKey>;

export type Prefecture = keyof (typeof PRICE_TABLES)[keyof typeof PRICE_TABLES]["prefectures"];
