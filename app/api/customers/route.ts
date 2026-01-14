import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { geocodeAddress } from "@/lib/geocode";

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
