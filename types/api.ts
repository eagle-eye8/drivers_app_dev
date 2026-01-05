import { OrderWithCustomer } from "./orderWithCustomer";

export type OrdersResponse = {
  success: boolean;
  data: OrderWithCustomer[];
};

export type KpiResponse = {
  success: boolean;
  data: {
    orderCount: number;
    totalAmount: number;
    pendingCount: number;
    employees: {
      id: string;
      name: string;
    }[];
  };
};
