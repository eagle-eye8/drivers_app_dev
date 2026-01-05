// lib/date.ts

/**
 * "YYYY-MM-DD"（JST）→ JST 0:00 の Date オブジェクト
 */
export function jstMidnightFromDateString(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

/**
 * Date → JST の YYYY-MM-DD
 */
export function getJstDateKey(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}
