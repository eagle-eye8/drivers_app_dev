"use client";

import { useState } from "react";
import { X, UserPlus, Mail, Phone, MapPin, LucideIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useSnackbar } from "@/components/ui/SnackbarProvider";
import { mutate } from "swr";
import { getJstDateString } from "@/lib/utils/date";
import { CustomerForm } from "@/types/customer";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type InputProps = {
  icon: LucideIcon;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export default function CreateCustomerModal({ isOpen, onClose }: Props) {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CustomerForm>({
    name: "",
    kana: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.address) {
      showSnackbar("名前と住所は必須です", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      const today = getJstDateString();
      mutate(`/api/dashboard?date=${today}`);
      showSnackbar("顧客を登録しました", "success");
      onClose();
    } catch {
      showSnackbar("顧客登録に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return <LoadingOverlay text="顧客情報登録中..." />;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* ================= Header ================= */}
        <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">顧客の新規登録</h2>
                <p className="text-sm text-slate-400">新しい顧客情報を登録します</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ================= Body ================= */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <FormInput icon={UserPlus} placeholder="名前（必須）" value={form.name} onChange={(v) => setForm((prev) => ({ ...prev, name: v }))} />
          <FormInput icon={UserPlus} placeholder="フリガナ（必須）" value={form.kana} onChange={(v) => setForm((prev) => ({ ...prev, kana: v }))} />
          <FormInput icon={Mail} placeholder="メールアドレス（任意）" value={form.email ?? ""} onChange={(v) => setForm((prev) => ({ ...prev, email: v }))} />
          <FormInput icon={Phone} placeholder="電話番号（任意）" value={form.phone ?? ""} onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))} />
          <FormInput icon={MapPin} placeholder="住所（必須）" value={form.address} onChange={(v) => setForm((prev) => ({ ...prev, address: v }))} />

          <p className="text-xs text-slate-400">※ 住所から緯度・経度を自動取得します。取得できない場合でも、後から顧客編集画面で設定できます。</p>
        </div>

        {/* ================= Footer ================= */}
        <div className="bg-slate-800/50 backdrop-blur border-t border-slate-700 p-6">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!form.name || !form.address} className="flex-1">
              登録
            </Button>
          </div>
        </div>

        {loading && <LoadingOverlay text="顧客情報を登録しています…" />}
      </div>
    </div>
  );
}

/* ================= Input ================= */

function FormInput({ icon: Icon, value, onChange, placeholder }: InputProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
      <input className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400 text-sm" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
