export function getJstDateString(date = new Date()) {
  const jst = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));

  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function getJstDateTimeString(dateInput: any) {
  if (!dateInput) return "---";

  const date = typeof dateInput.toDate === "function" 
    ? dateInput.toDate() 
    : new Date(dateInput);

  const jst = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));

  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  const hh = String(jst.getHours()).padStart(2, "0");
  const mm = String(jst.getMinutes()).padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}`;
}
