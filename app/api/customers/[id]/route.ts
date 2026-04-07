import { adminDb } from "@/lib/firebaseAdmin";
import { geocodeAddress } from "@/lib/geocode";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { name, kana, address, email, phones, location } = body;

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (kana !== undefined) updateData.kana = kana.trim();
    if (email !== undefined) updateData.email = email?.trim().toLowerCase() || null;
    if (address !== undefined) updateData.address = address.trim();

    if (phones && Array.isArray(phones)) {
      const sanitizedPhones = phones
        .map((p: { label: string; value: string }) => ({
          label: p.label || "携帯",
          value: p.value.replace(/[ー－ｰ\s\(\)\-\+\x20]/g, "").replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)),
        }))
        .filter((p: { value: string }) => p.value.length > 0);

      // 数字チェック
      const isAllPhonesValid = sanitizedPhones.every((p: { value: string }) => /^[0-9]+$/.test(p.value));
      if (!isAllPhonesValid) {
        return NextResponse.json({ error: "電話番号に数字以外の文字が含まれています" }, { status: 400 });
      }
      updateData.phones = sanitizedPhones;
    }
    const latNum = Number(location?.lat);
    const lngNum = Number(location?.lng);

    const hasValidManualLocation = location && !isNaN(latNum) && !isNaN(lngNum) && typeof location.lat !== "undefined" && location.lat !== "";

    if (hasValidManualLocation) {
      updateData.location = {
        lat: latNum,
        lng: lngNum,
      };
    } else if (address?.trim()) {
      updateData.location = await geocodeAddress(address.trim()).catch(() => null);
    } else {
      updateData.location = null;
    }
    await adminDb.collection("customers").doc(id).update(updateData);

    return NextResponse.json({ success: true, message: "更新が完了しました" });
  } catch (e) {
    console.error("PATCH Error:", e);
    return NextResponse.json({ success: false, error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "IDが指定されていません" }, { status: 400 });
    }

    await adminDb.collection("customers").doc(id).delete();

    return NextResponse.json({ success: true, message: "削除が完了しました" });
  } catch (e) {
    console.error("Delete Error:", e);
    return NextResponse.json({ error: "削除処理中にエラーが発生しました" }, { status: 500 });
  }
}
