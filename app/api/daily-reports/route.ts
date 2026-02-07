import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const userId = searchParams.get("userId");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }
  try {
    let query: any = adminDb.collection("dailyReports").where("date", "==", date);

    // userId が指定されている場合は、そのユーザーのみに絞り込む
    if (userId) {
      query = query.where("userId", "==", userId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const reports = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 個人の場合はオブジェクト1つ、管理者の場合は配列で返るが
    // フロントの logic に合わせて常に配列で返すと扱いやすいです
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("Firestore Get Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, expenses } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: "必須項目（userId, date）が不足しています" }, { status: 400 });
    }

    // 経費の合計額を算出
    const totalExpense = expenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);

    // ドキュメントIDを「日付_ユーザーID」で固定して一意にする
    const reportId = `${date}_${userId}`;
    await adminDb.collection("dailyReports").doc(reportId).set(
      {
        userId,
        date,
        expenses,
        totalExpense,
        updatedAt: Timestamp.now(), // サーバー側でタイムスタンプを付与
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, id: reportId });
  } catch (error: any) {
    console.error("Firestore Save Error:", error);
    return NextResponse.json({ error: "Firestoreへの保存に失敗しました", message: error.message }, { status: 500 });
  }
}
