"use client";

import { BaseDialog } from "@/components/ui/BaseDialog";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useToast } from "../toast/useToast";

export function OrderCreateDialog({ dialog }: any) {
  const [tab, setTab] = useState<"select" | "new">("select");
  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", address: "" });
  const { showToast } = useToast();

  const { data: customers } = useSWR("/api/customers");

  async function handleCreate() {
    setSaving(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: tab === "select" ? customerId : null,
          newCustomer: tab === "new" ? newCustomer : null,
        }),
      });

      if (!res.ok) throw new Error();

      showToast("注文を作成しました", "success");
      dialog.close();
      mutate("/api/dashboard");
    } catch {
      showToast("作成に失敗しました", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseDialog open={dialog.isOpen} onClose={dialog.close} title="注文作成">
      {/* tabs */}
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("select")} className={tab === "select" ? "font-bold" : ""}>
          既存顧客
        </button>
        <button onClick={() => setTab("new")} className={tab === "new" ? "font-bold" : ""}>
          新規顧客
        </button>
      </div>

      {tab === "select" && (
        <select className="w-full border p-2" onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">選択</option>
          {customers?.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {tab === "new" && (
        <div className="space-y-2">
          <input placeholder="名前" className="border p-2 w-full"
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
          <input placeholder="住所" className="border p-2 w-full"
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={saving}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
      >
        {saving ? "作成中..." : "作成"}
      </button>
    </BaseDialog>
  );
}
