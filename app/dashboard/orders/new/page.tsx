"use client";

import { useState } from "react";

export default function CreateOrderPage() {
  const [customerId, setCustomerId] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [pickupWindow, setPickupWindow] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([{ to: "", quantity: 1, pickupType: "normal", size: 60 }]);

  const addItem = () => {
    setItems([...items, { to: "", quantity: 1, pickupType: "normal", size: 60 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/orders/new", {
      method: "POST",
      body: JSON.stringify({
        customerId,
        reservationDate,
        pickupWindow,
        amount,
        notes,
        items,
      }),
    });

    const json = await res.json();
    alert(json.success ? "注文作成完了！" : "エラー: " + json.error);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow space-y-6 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">注文作成</h1>

        {/* 顧客ID */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">顧客ID</label>
          <input className="w-full border p-2 rounded" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
        </div>

        {/* 日付 */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">集荷日</label>
          <input type="date" className="w-full border p-2 rounded" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} />
        </div>

        {/* 時間帯 */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">時間帯 (1,2,3)</label>
          <input type="number" className="w-full border p-2 rounded" value={pickupWindow ?? ""} onChange={(e) => setPickupWindow(Number(e.target.value))} />
        </div>

        {/* 金額 */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">金額</label>
          <input type="number" className="w-full border p-2 rounded" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>

        {/* 備考 */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">備考</label>
          <textarea className="w-full border p-2 rounded" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Items */}
        <div className="space-y-3">
          <label className="text-sm text-gray-600">配達アイテム</label>

          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 border p-3 rounded space-y-2">
              <input placeholder="配達先" className="w-full border p-2 rounded" value={item.to} onChange={(e) => updateItem(index, "to", e.target.value)} />

              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="数量" className="border p-2 rounded" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />

                <select className="border p-2 rounded" value={item.pickupType} onChange={(e) => updateItem(index, "pickupType", e.target.value)}>
                  <option value="normal">普通</option>
                  <option value="cold">冷蔵</option>
                </select>

                <input type="number" placeholder="サイズ" className="border p-2 rounded" value={item.size} onChange={(e) => updateItem(index, "size", Number(e.target.value))} />
              </div>
            </div>
          ))}

          <button onClick={addItem} className="w-full bg-gray-200 p-2 rounded font-semibold">
            + アイテム追加
          </button>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} className="w-full bg-black text-white p-3 rounded-xl text-lg">
          注文を作成する
        </button>
      </div>
    </div>
  );
}
