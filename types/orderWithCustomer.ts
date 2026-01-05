// types/orderWithCustomer.ts
import { Order } from "./order";
import { Customer } from "./customer";

export type AssignedEmployee = {
  id: string;
  name: string;
};

export type DashboardEmployee = {
  id: string;
  name: string;
  assignedOrderCount: number;
};

export type OrderWithCustomer = Order & {
  customer: Customer | null;
  assignedEmployee?: AssignedEmployee | null;
};
