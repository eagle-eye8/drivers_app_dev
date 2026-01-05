// components/orders/OrderEditDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useToast } from "@/components/toast/useToast";
import { Order } from "@/types/order";

type Props = {
  order: Order;
  employees?: { id: string; name: string }[];
  open: boolean;
  onClose: () => void;
};

export function OrderEditDialog({ order, employees = [], open, onClose }: Props) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    status: "pending",
    amount: 0,
    assignedUid: null as string | null,
  });

  const [saving, setSaving] = useState(false);

  /** dialog が開かれたら初期値セット */
  useEffect(() => {
    if (!order) return;
    setForm({
      status: order.status,
      amount: order.amount ?? 0,
      assignedUid: order.assignedUid ?? null,
    });
  }, [order]);

  if (!order) return null;

  async function handleSave() {
    setSaving(true);
    let previousData: any;

    // 🔄 optimistic update
    mutate(
      "/api/dashboard",
      (current: any) => {
        if (!current) return current;
        previousData = current;

        return {
          ...current,
          data: {
            ...current.data,
            todayOrders: current.data.todayOrders.map((o: any) => (o.id === order.id ? { ...o, ...form } : o)),
          },
        };
      },
      false
    );

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("save failed");
      showToast("保存しました", "success");
      onClose();
      mutate("/api/dashboard");
    } catch (e) {
      mutate("/api/dashboard", previousData, false);
      showToast("保存に失敗しました", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseDialog open={open} onClose={onClose} title="注文編集" onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        {/* 顧客名 */}
        {/* <div className="text-sm text-gray-600">顧客名：{order.customer?.name ?? "不明"}</div> */}

        {/* status */}
        <div>
          <label className="block text-sm mb-1">ステータス</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full border rounded p-2">
            <option value="pending">未対応</option>
            <option value="assigned">対応中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>

        {/* amount */}
        <div>
          <label className="block text-sm mb-1">金額</label>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border rounded p-2" />
        </div>

        {/* employee */}
        <div>
          <label className="block text-sm mb-1">担当者</label>
          <select
            value={form.assignedUid ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                assignedUid: e.target.value || null,
              })
            }
            className="w-full border rounded p-2"
          >
            <option value="">未割り当て</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </BaseDialog>
  );
}
