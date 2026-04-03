import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!year || !month) {
      return NextResponse.json({ error: "Year and Month are required" }, { status: 400 });
    }

    // 1. 対象月の開始日と終了日を Timestamp で作成 (JST 基準)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0); // 月初 00:00:00
    const endDate = new Date(year, month, 0, 23, 59, 59); // 月末 23:59:59

    const startTs = Timestamp.fromDate(startDate);
    const endTs = Timestamp.fromDate(endDate);

    // 2. 注文データの取得 (status: completed)
    // 既存の orders API と同様に reservationDate で絞り込み
    const ordersSnap = await adminDb.collection("orders").where("status", "==", "completed").where("reservationDate", ">=", startTs).where("reservationDate", "<=", endTs).get();

    // 3. 経費データ (dailyReports) の取得
    // dailyReports は文字列の "date" (YYYY-MM-DD) で保存されているため、その範囲で取得
    const startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const expensesSnap = await adminDb.collection("dailyReports").where("date", ">=", startDateStr).where("date", "<=", endDateStr).get();

    // 4. 集計用の Map を初期化 (1日〜末日まで)
    const dailyMap = new Map();
    const lastDay = endDate.getDate();
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dailyMap.set(dateStr, {
        date: dateStr,
        day: d,
        sales: 0,
        count: 0,
        items: 0,
        postOfficeFee: 0,
        expense: 0,
        profit: 0,
      });
    }

    // 5. 注文データのマッピング
    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      // reservationDate (Timestamp) から YYYY-MM-DD 文字列を取得
      const dateStr = data.reservationDate.toDate().toLocaleDateString("sv-SE");
      if (dailyMap.has(dateStr)) {
        const stats = dailyMap.get(dateStr);
        stats.sales += Number(data.amount) || 0;
        stats.count += 1;
        // 個数の集計 (items 配列内の quantity の合計)
        const itemTotal = data.items?.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0) ?? 0;
        stats.items += itemTotal;
        stats.postOfficeFee += Number(data.postOfficeFee) || 0;
      }
    });

    // 6. 経費データのマッピング
    expensesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const dateStr = data.date; // "YYYY-MM-DD"
      if (dailyMap.has(dateStr)) {
        const stats = dailyMap.get(dateStr);
        stats.expense += Number(data.totalExpense) || 0;
      }
    });

    // 7. 最終計算 (利益 = 売上 - 経費)
    const dailyData = Array.from(dailyMap.values()).map((stats) => ({
      ...stats,
      profit: stats.sales - (stats.postOfficeFee + stats.expense),
    }));

    // 8. 月間総計の算出
    const summary = dailyData.reduce(
      (acc, curr) => ({
        sales: acc.sales + curr.sales,
        profit: acc.profit + curr.profit,
        count: acc.count + curr.count,
        items: acc.items + curr.items,
        postOfficeFee: acc.postOfficeFee + curr.postOfficeFee,
      }),
      { sales: 0, profit: 0, count: 0, items: 0, postOfficeFee: 0 },
    );

    return NextResponse.json({
      success: true,
      summary,
      dailyData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
