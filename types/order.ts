import { OrderStatus } from "@/lib/orderStatus";
import { FirestoreTimestamp } from "./pickup";

export type Order = {
  id: string;
  customerId: string;
  assignedUid?: string | null;
  reservationDate: FirestoreTimestamp; // YYYY-MM-DD
  routeGroupId: string; // customerId-YYYY-MM-DD
  status: OrderStatus;
  amount: number;
  paymentStatus: "unpaid" | "paid" | "pending";
  notes?: string;
  pickupWindow?: number; // 1,2,3
  items: OrderItem[];
  isMerged: boolean;
  deliveryOrder: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  // priceVersion: PriceTableVersion;
};
