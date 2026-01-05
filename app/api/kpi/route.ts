import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json(
        { success: false, error: "date is required" },
        { status: 400 }
      );
    }

    const ordersSnap = await adminDb
      .collection("orders")
      .where("reservationDate", "==", date)
      .get();

    let totalAmount = 0;
    let unassigned = 0;
    const customerSet = new Set<string>();

    ordersSnap.docs.forEach((doc) => {
      const o = doc.data();

      totalAmount += o.amount || 0;
      if (!o.assignedUid) unassigned += 1;
      if (o.customerId) customerSet.add(o.customerId);
    });

    const employeesSnap = await adminDb
      .collection("employees")
      .where("active", "==", true)
      .get();

    return NextResponse.json({
      success: true,
      data: {
        date,
        orderCount: ordersSnap.size,
        uniqueCustomers: customerSet.size,
        totalAmount,
        unassigned,
        employeeCount: employeesSnap.size,
      },
    });
  } catch (err) {
    console.error("KPI error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
