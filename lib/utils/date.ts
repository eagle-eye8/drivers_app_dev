export function getJstDateString(date = new Date()) {
  const jst = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));

  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}
