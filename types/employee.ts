export type Employee = {
  id: string;
  name: string;
  role: "driver" | "admin" | "staff";
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: number;
};
