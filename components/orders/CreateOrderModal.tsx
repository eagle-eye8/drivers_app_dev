"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types/customer";
import { AssignedEmployee } from "@/types/orderWithCustomer";
import { X, Plus, Calendar, User, Users } from "lucide-react";
import Button from "../ui/button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";
import { getJstDateString } from "@/lib/utils/date";
import { mutate } from "swr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  employees: AssignedEmployee[];
};

export default function CreateOrderModal({ isOpen, onClose, customers, employees }: Props) {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const today = getJstDateString();

  const [form, setForm] = useState({
    customerId: "",
    reservationDate: today,
    assignedUid: "",
  });

  /* -------------------------------
     電話番号 → 顧客一致ロジック
  -------------------------------- */
  useEffect(() => {
    if (!phone) {
      setMatchedCustomer(null);
      setForm((f) => ({ ...f, customerId: "" }));
      return;
    }

    const normalized = phone.replace(/[-\s]/g, "");
    const found = customers.find((c) => c.phone?.replace(/[-\s]/g, "") === normalized);

    if (found) {
      setMatchedCustomer(found);
      setForm((f) => ({ ...f, customerId: found.id }));
    } else {
      setMatchedCustomer(null);
      setForm((f) => ({ ...f, customerId: "" }));
    }
  }, [phone, customers]);

  /* -------------------------------
     送信
  -------------------------------- */
  const handleSubmit = async () => {
    if (!form.customerId || !form.reservationDate) {
      showSnackbar("顧客と集荷日を入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      mutate(`/api/dashboard?date=${today}`);
      showSnackbar("注文を作成しました", "success");
      onClose();
    } catch {
      showSnackbar("注文作成に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return <LoadingOverlay text="注文登録中..." />;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-slate-800/50 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">新規集荷注文</h2>
                <p className="text-sm text-slate-400">電話番号で顧客を一致させます</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 集荷日 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              集荷日<span className="text-red-400">*</span>
            </label>
            <input type="date" min={today} value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500" />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 text-cyan-400" />
              顧客（電話番号）<span className="text-red-400">*</span>
            </label>

            <input type="tel" placeholder="09012345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500" />

            {phone && (
              <div className="mt-2">
                {matchedCustomer ? (
                  <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    ✔ {matchedCustomer.name}（{matchedCustomer.phone}）
                  </div>
                ) : (
                  <div className="text-sm text-red-400">この電話番号の顧客が見つかりません</div>
                )}
              </div>
            )}
          </div>

          {/* 担当者 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              担当者（任意）
            </label>
            <select value={form.assignedUid} onChange={(e) => setForm({ ...form, assignedUid: e.target.value })} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500">
              <option value="">未指定</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* フッター */}
        <div className="bg-slate-800/50 border-t border-slate-700 p-6">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!matchedCustomer} className="flex-1">
              登録
            </Button>
          </div>
        </div>

        {loading && <LoadingOverlay text="注文を作成しています…" />}
      </div>
    </div>
  );
}
