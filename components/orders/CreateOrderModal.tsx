"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types/customer";
import { AssignedEmployee } from "@/types/orderWithCustomer";
import { X, Plus, Package, Snowflake, Weight, Calendar, User, Users } from "lucide-react";
import Button from "../ui/button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  employees: AssignedEmployee[];
};

function getTodayJstString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CreateOrderModal({ isOpen, onClose, customers, employees }: Props) {
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    customerId: "",
    assignedUid: "",
    reservationDate: getTodayJstString(),
    kind: "normal",
    quantity: 1,
  });

  const handleSubmit = async () => {
    if (!form.customerId || !form.reservationDate) {
      alert("顧客と集荷日を選択してください");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      showSnackbar("注文を作成できました", "success");
    } catch (error) {
      showSnackbar("注文作成に失敗しました", "error");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const kindOptions = [
    { value: "normal", label: "普通", icon: Package, color: "cyan" },
    { value: "chilled", label: "チルド", icon: Snowflake, color: "blue" },
    { value: "heavy", label: "重量物", icon: Weight, color: "amber" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">注文の新規登録</h2>
                <p className="text-sm text-slate-400">新しい集荷注文を作成します</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* 集荷日 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              集荷日 <span className="text-red-400">*</span>
            </label>
            <input type="date" min={getTodayJstString()} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} />
          </div>

          {/* 顧客 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 text-cyan-400" />
              顧客 <span className="text-red-400">*</span>
            </label>
            <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">顧客を選択してください</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 配送種別 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">配送種別</label>
            <div className="grid grid-cols-3 gap-3">
              {kindOptions.map(({ value, label, icon: Icon, color }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, kind: value })} className={`p-4 rounded-lg border-2 transition-all ${form.kind === value ? (color === "cyan" ? "bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/50" : color === "blue" ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/50" : "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/50") : "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500"}`}>
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${form.kind === value ? (color === "cyan" ? "text-cyan-400" : color === "blue" ? "text-blue-400" : "text-amber-400") : "text-slate-400"}`} />
                  <span className={`text-sm font-medium ${form.kind === value ? "text-white" : "text-slate-400"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 数量 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">数量</label>
            <input type="number" min={1} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })} />
          </div>

          {/* 担当者 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              担当者（任意）
            </label>
            <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" value={form.assignedUid} onChange={(e) => setForm({ ...form, assignedUid: e.target.value })}>
              <option value="">担当者を選択（任意）</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* フッター */}
        <div className="bg-slate-800/50 backdrop-blur border-t border-slate-700 p-6">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!form.customerId || !form.reservationDate} className="flex-1">
              登録
            </Button>
          </div>
        </div>
        {loading && <LoadingOverlay text="集荷完了を登録しています…" />}
      </div>
    </div>
  );
}
