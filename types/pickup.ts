export type Pickup = {
  id?: string;
  orderId: string; // 紐付く注文ID
  items: {
    to: string;
    type: string;
    size: number;
    quantity: number;
  }[];
  pickupAt: number;
  createdAt: number;
};

export type PickupData = {
  prices: Record<number, number>;
  sizes: readonly number[];
};

export type PrefecturePrice = {
  normal: PickupData;
  cold: PickupData;
  heavy: number;
};

export type PriceTable = Record<string, PrefecturePrice>;
