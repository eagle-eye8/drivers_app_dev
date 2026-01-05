export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  createdAt: number;
  updatedAt: number;
};
