"use client";

import { useEffect, useState, useRef } from "react";
import { Customer } from "@/types/customer";
import { AssignedEmployee } from "@/types/orderWithCustomer";
import { X, Plus, Calendar, User, Users, Loader2 } from "lucide-react";
import Button from "../ui/button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";
import { getJstDateString } from "@/lib/utils/date";
import { mutate } from "swr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  employees: AssignedEmployee[];
};

export default function CreateOrderModal({ isOpen, onClose, employees }: Props) {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = getJstDateString();

  const [form, setForm] = useState({
    customerId: "",
    reservationDate: today,
    assignedEmployee: { id: "", name: "" },
  });

  // ─── 電話番号入力 → debounce → API検索 ──────────────────────────────────
  useEffect(() => {
    // リセット
    setMatchedCustomer(null);
    setNotFound(false);
    setForm((f) => ({ ...f, customerId: "" }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = phone.replace(/[-\s]/g, "");
    // 10桁未満は検索しない
    if (normalized.length < 10) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/customers/search?phone=${encodeURIComponent(normalized)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (data.customer) {
          setMatchedCustomer(data.customer);
          setForm((f) => ({ ...f, customerId: data.customer.id }));
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms待ってから検索（打鍵ごとにAPIを叩かない）

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [phone]);

  // ─── 送信 ────────────────────────────────────────────────────────────────
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

  return (
    <div className="fixed inset-0 z-100 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
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
                <p className="text-sm text-slate-400">電話番号で顧客を検索します</p>
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
            <div className="relative">
              <input type="tel" placeholder="09012345678" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[-\s]/g, ""))} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 pr-10" />
              {/* 検索中スピナー */}
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            {/* 検索結果フィードバック */}
            {!searching && phone.replace(/[-\s]/g, "").length >= 5 && (
              <div className="mt-2">
                {matchedCustomer ? (
                  <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    ✔ {matchedCustomer.name}（{matchedCustomer.phone}）
                  </div>
                ) : notFound ? (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">この電話番号の顧客が見つかりません</div>
                ) : null}
              </div>
            )}
          </div>

          {/* 担当者 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              担当者（任意）
            </label>
            <select
              value={form.assignedEmployee.id}
              onChange={(e) => {
                const selected = employees.find((emp) => emp.id === e.target.value);
                setForm({
                  ...form,
                  assignedEmployee: selected ? { id: selected.id, name: selected.name } : { id: "", name: "" },
                });
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500"
            >
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
            <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!matchedCustomer || searching} className="flex-1">
              登録
            </Button>
          </div>
        </div>

        {loading && <LoadingOverlay text="注文を作成しています…" />}
      </div>
    </div>
  );
}
