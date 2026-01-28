// app/api/orders/optimize/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orders, originAddress } = await req.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) throw new Error("API Key missing");
    if (!orders || orders.length === 0) return NextResponse.json({ success: false });

    // Google Routes API (v2) へのリクエスト
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.optimizedWaypointOrder",
      },
      body: JSON.stringify({
        // 出発地（現在地が理想だが、API側では拠点を指定するか、フロントから渡す）
        origin: { address: "現在地" },
        // 目的地（最後の配送先を固定）
        destination: { address: orders[orders.length - 1].customer?.address },
        // 経由地
        intermediates: orders.slice(0, -1).map((o: any) => ({
          address: o.customer?.address,
        })),
        travelMode: "DRIVE",
        optimizeWaypointOrder: true,
      }),
    });

    const result = await response.json();
    const optimizedIndices = result.routes?.[0]?.optimizedWaypointOrder;

    // Googleがエラー（上限超えなど）を返した場合
    if (response.status === 429) {
      return NextResponse.json(
        {
          success: false,
          errorType: "QUOTA_EXCEEDED",
          message: "本日のルート作成上限に達しました。",
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ success: true, optimizedIndices });
  } catch (err) {
    console.error("Optimization Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
