// lib/kanbanColumns.ts
import { OrderStatus } from "./orderStatus";

export const KANBAN_COLUMNS: {
  id: OrderStatus;
  title: string;
  collapsible?: boolean;
}[] = [
  { id: "pending", title: "未対応" },
  { id: "assigned", title: "割り当て済み注文" },
  { id: "completed", title: "完了", collapsible: true },
  { id: "cancelled", title: "キャンセル" },
];
