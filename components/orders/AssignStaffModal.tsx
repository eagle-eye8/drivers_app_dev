"use client";

import { Employee } from "@/types/employee";
import { AssignedEmployee } from "@/types/orderWithCustomer";
import { BadgeCheck, ChevronDown, Save, UserPlus, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  orderId: string;
  assignedEmployee?: AssignedEmployee | null;
  onClose: () => void;
  onAssigned: () => void;
};

export function AssignStaffModal({ orderId, assignedEmployee, onClose, onAssigned }: Props) {
  const { data } = useSWR("/api/employees", fetcher);
  const { showSnackbar } = useSnackbar();
  const employees: Employee[] = data?.data ?? [];
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(assignedEmployee?.id ?? "");

  async function handleAssign() {
    setLoading(true);
    try {
      const selected = employees.find((emp) => emp.id === selectedId);
      const payload = selected ? { id: selected.id, name: selected.name } : null;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedEmployee: payload }),
      });

      if (!res.ok) throw new Error();

      showSnackbar("担当者を更新しました", "success");
      onAssigned();
      onClose();
    } catch {
      showSnackbar("更新に失敗しました。時間をおいて再度お試しください。", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4 cursor-pointer" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-slide-in-up cursor-default" onClick={(e) => e.stopPropagation()}>
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/30">
              <UserPlus size={25} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">担当者の割り当て</h3>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
              <BadgeCheck size={18} className="text-blue-500" />
              集荷担当スタッフを選択
            </label>
            <div className="relative group">
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-slate-900 text-[16px] font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer group-hover:bg-white group-hover:border-slate-200">
                <option value="">未割り当て（解除）</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-6 flex items-center justify-between gap-4 border-t border-slate-100">
          <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-4 py-2">
            キャンセル
          </button>
          <button onClick={handleAssign} disabled={loading} className="flex-1 max-w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中...
              </span>
            ) : (
              <>
                変更
              </>
            )}
          </button>
        </div>
      </div>
      {loading && <LoadingOverlay text="従業員を変更しています..." />}
    </div>
  );
}
