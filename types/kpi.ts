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
