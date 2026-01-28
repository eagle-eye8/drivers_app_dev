import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { geocodeAddress } from "@/lib/geocode";

export async function GET() {
  try {
    const customerSnaps = await adminDb.collection("customers").get();

    const customers = customerSnaps.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }))
    console.log("customers", customers);
    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    if (!name || !address) {
      return NextResponse.json({ error: "name and address required" }, { status: 400 });
    }

    let location = null;

    try {
      location = await geocodeAddress(address);
    } catch {
      location = null;
    }

    const now = Timestamp.now();

    await adminDb.collection("customers").add({
      name,
      email: email || null,
      phone: phone || null,
      address,
      location,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
