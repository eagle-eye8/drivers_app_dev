import { adminDb } from "@/lib/firebaseAdmin";
import { geocodeAddress } from "@/lib/geocode";
import { getJstDateTimeString } from "@/lib/utils/date";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const customerSnaps = await adminDb.collection("customers").orderBy("kana", "asc").orderBy("updatedAt", "desc").get();

    const customers = customerSnaps.docs.map((doc) => {
      const data = doc.data();
      const searchIndex = [data.name || "", data.kana || "", ...(data.phones || []).map((p: any) => p.value.replace(/[ -]/g, ""))].join(" ").toLowerCase();
      return {
        id: doc.id,
        ...data,
        searchIndex,
        updatedAt: data.updatedAt ? getJstDateTimeString(data.updatedAt) : "---",
        createdAt: data.createdAt ? getJstDateTimeString(data.createdAt) : "---",
      };
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, kana, email, phones, address, location } = body;

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "名前と住所は必須です" }, { status: 400 });
    }

    const sanitizedPhones = (phones || [])
      .map((p: { label: string; value: string }) => ({
        label: p.label || "携帯",
        value: p.value.replace(/[ー－ｰ\s\(\)\-\+\x20]/g, "").replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)),
      }))
      .filter((p: { value: string }) => p.value.length > 0);

    const isAllPhonesValid = sanitizedPhones.every((p: { value: string }) => /^[0-9]+$/.test(p.value));
    if (!isAllPhonesValid) {
      return NextResponse.json({ error: "電話番号に数字以外の文字が含まれています" }, { status: 400 });
    }

    const sanitizedEmail = email?.trim().toLowerCase() || null;
    const sanitizedKana = kana?.trim() || "";
    const sanitizedAddress = address.trim();

    let finalLocation = null;
    if (location && typeof location.lat === "number" && typeof location.lng === "number") {
      finalLocation = location;
    } else if (sanitizedAddress) {
      finalLocation = await geocodeAddress(sanitizedAddress).catch(() => null);
    }

    const now = Timestamp.now();

    const docRef = await adminDb.collection("customers").add({
      name: name.trim(),
      kana: sanitizedKana,
      email: sanitizedEmail,
      phones: sanitizedPhones,
      address: sanitizedAddress,
      location: finalLocation,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (e) {
    console.error("Customer creation error:", e);
    return NextResponse.json({ success: false, error: "登録に失敗しました" }, { status: 500 });
  }
}
