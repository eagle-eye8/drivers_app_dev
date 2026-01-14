import { FirestoreTimestamp } from "./pickup";

export type Employee = {
  id: string;
  name: string;
  role: "driver" | "admin" | "staff";
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: FirestoreTimestamp;
};
