import { FirestoreTimestamp } from "./pickup";

export type Customer = {
  id: string;
  name: string;
  kana: string;
  email?: string;
  phone?: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
};

export type CustomerForm = Omit<
  Customer,
  "id" | "location" | "createdAt" | "updatedAt"
>;
