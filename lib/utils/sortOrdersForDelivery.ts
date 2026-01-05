import { OrderWithCustomer } from "@/types/orderWithCustomer";

export function sortOrdersForDelivery(orders: OrderWithCustomer[]) {
  return [...orders].sort((a, b) => {
    if (a.status === "completed") return 1;
    if (b.status === "completed") return -1;

    return (a.deliveryOrder ?? 999) - (b.deliveryOrder ?? 999);
  });
}
