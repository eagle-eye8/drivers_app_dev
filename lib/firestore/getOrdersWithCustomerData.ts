import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function getOrdersWithCustomerData() {
  const snapshot = await getDocs(collection(db, "orders"));

  const orders = [];

  for (const d of snapshot.docs) {
    const order = d.data();
    const customerRef = doc(db, "customers", order.customerId);
    const customerSnap = await getDoc(customerRef);
    const customer = customerSnap.data();

    orders.push({
      id: d.id,
      customerId: order.customerId ?? "",
      reservationDate: order.reservationDate ?? "",
      assignedUid: order.assignedUid ?? "",

      customer: {
        name: customer?.name ?? "",
        address: customer?.address ?? "",
        phone: customer?.phone ?? "",
        note: customer?.note ?? "",
        lat: customer?.lat ?? 0,
        lng: customer?.lng ?? 0,
      },
    });
  }

  return orders;
}
