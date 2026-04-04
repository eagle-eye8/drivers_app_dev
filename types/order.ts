import { OrderStatus } from "@/lib/orderStatus";
import { FirestoreTimestamp } from "./pickup";

export type Order = {
  id: string;
  customerId: string;
  assignedEmployee?: { id: string; name: string } | null;
  reservationDate: FirestoreTimestamp; // YYYY-MM-DD
  status: OrderStatus;
  amount: number;
  postOfficeFee: number;
  paymentStatus: "unpaid" | "paid" | "pending";
  notes?: string;
  items: OrderItem[];
  isMerged: boolean;
  deliveryOrder: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  // priceVersion: PriceTableVersion;
};
