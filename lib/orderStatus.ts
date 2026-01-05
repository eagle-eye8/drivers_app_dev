// lib/orderStatus.ts
export type OrderStatus = "pending" | "assigned" | "completed" | "cancelled";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    badgeClass: string;
    columnClass?: string;
  }
> = {
  pending: {
    label: "未対応",
    badgeClass: "bg-gray-100 text-gray-700",
  },
  assigned: {
    label: "対応中",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "完了",
    badgeClass: "bg-green-100 text-green-700",
    columnClass: "border-green-300",
  },
  cancelled: {
    label: "キャンセル",
    badgeClass: "bg-red-100 text-red-700",
  },
};
