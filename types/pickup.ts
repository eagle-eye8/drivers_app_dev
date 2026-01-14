import type { Timestamp as ClientTimestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

// クライアントでもサーバーでも通る「共通の型」をエイリアスとして定義
export type FirestoreTimestamp = ClientTimestamp | AdminTimestamp;

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
  createdAt: FirestoreTimestamp;
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
