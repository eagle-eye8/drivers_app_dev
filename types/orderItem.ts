// 型定義
type Prefecture = "北海道" | "青森県" | "岩手県" | "宮城県" | "秋田県" | "山形県" | "福島県" | "茨城県" | "栃木県" | "群馬県" | "埼玉県" | "千葉県" | "東京都" | "神奈川県" | "山梨県" | "長野県" | "新潟県" | "富山県" | "石川県" | "福井県" | "静岡県" | "愛知県" | "三重県" | "岐阜県" | "京都府" | "大阪府" | "兵庫県" | "奈良県" | "和歌山県" | "鳥取県" | "岡山県" | "広島県" | "島根県" | "山口県" | "香川県" | "愛媛県" | "高知県" | "徳島県" | "福岡県" | "佐賀県" | "長崎県" | "大分県" | "熊本県" | "宮崎県" | "鹿児島県" | "沖縄県";

type NormalSize = 60 | 80 | 100 | 120 | 140 | 160 | 170;
type ChilledSize = 60 | 80 | 120 | 140 | 150;

type OrderItem = { kind: "normal"; to: Prefecture; size: NormalSize; quantity: number } | { kind: "chilled"; to: Prefecture; size: ChilledSize; quantity: number } | { kind: "heavy"; to: Prefecture; quantity: number };
