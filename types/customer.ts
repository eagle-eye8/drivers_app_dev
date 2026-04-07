import { Timestamp } from "firebase-admin/firestore";

export const PHONE_LABELS = ["携帯", "自宅", "事務所", "その他"] as const;
export type PhoneLabel = (typeof PHONE_LABELS)[number];

export type CustomerPhone = {
  label: PhoneLabel;
  value: string;
};

export type CustomerDocument = {
  name: string;
  kana: string;
  email: string | null;
  phones: CustomerPhone[];
  address: string;
  location: { lat: number; lng: number } | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Customer = {
  id: string;
  name: string;
  kana: string;
  email: string | null;
  phones: CustomerPhone[];
  address: string;
  location: { lat: number; lng: number } | null;
  searchIndex: string;
  createdAt: string;
  updatedAt: string;
};
export type CustomerForm = Omit<Customer, "id" | "location" | "createdAt" | "updatedAt">;
