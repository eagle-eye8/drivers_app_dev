"use client";

import useSWR from "swr";
import { Employee } from "@/types/employee";
import { useState } from "react";
import { LoadingOverlay } from "../ui/LoadingOverlay";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  orderId: string;
  currentUid?: string | null;
  onClose: () => void;
  onAssigned: () => void; // ← mutate 用
};

export function AssignStaffModal({ orderId, currentUid, onClose, onAssigned }: Props) {
  const { data } = useSWR("/api/employees", fetcher);
  const employees: Employee[] = data?.data ?? [];

  const [loading, setLoading] = useState(false);
  const [selectedUid, setSelectedUid] = useState(currentUid ?? "");

  async function handleAssign() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedUid: selectedUid || null }),
      });
      showSnackbar("担当者を変更しました", "success");
    } catch {
      showSnackbar("担当者の変更に失敗しました", "error");
    } finally {
      setLoading(false);
      onAssigned(); // ← mutate
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">担当者を割り当て</h3>
        <select value={selectedUid ?? ""} onChange={(e) => setSelectedUid(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">未割り当て</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            キャンセル
          </button>
          <button onClick={handleAssign} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            保存
          </button>
        </div>
      </div>
      {loading && <LoadingOverlay text="集荷完了を登録しています…" />}
    </div>
  );
}
function showSnackbar(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}
