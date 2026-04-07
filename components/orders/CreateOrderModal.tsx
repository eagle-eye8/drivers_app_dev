"use client";

import { getJstDateString } from "@/lib/utils/date";
import { Customer } from "@/types/customer";
import { AssignedEmployee } from "@/types/orderWithCustomer";
import { Calendar, CheckCircle2, Loader2, MapPin, Package, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { mutate } from "swr";
import Button from "../ui/button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useSnackbar } from "../ui/SnackbarProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  employees: AssignedEmployee[];
};

export default function CreateOrderModal({ isOpen, onClose, employees }: Props) {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const today = getJstDateString();

  const [form, setForm] = useState({
    customerId: "",
    reservationDate: today,
    assignedEmployee: { id: "", name: "" },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchAllCustomers = async () => {
        setFetchingCustomers(true);
        try {
          const res = await fetch("/api/customers");
          if (!res.ok) throw new Error();
          const data = await res.json();
          setCustomers(data);
        } catch (error) {
          showSnackbar("顧客データの取得に失敗しました", "error");
        } finally {
          setFetchingCustomers(false);
        }
      };
      fetchAllCustomers();
    } else {
      setSearchQuery("");
      setSelectedCustomer(null);
      setCustomers([]);
      setForm({
        customerId: "",
        reservationDate: today,
        assignedEmployee: { id: "", name: "" },
      });
    }
  }, [isOpen, today, showSnackbar]);

  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().replace(/[-\s]/g, "");
    if (q.length < 2 || selectedCustomer) return [];

    return customers.filter((c) => c.searchIndex?.toLowerCase().includes(q)).slice(0, 6); // 最大6件表示
  }, [searchQuery, customers, selectedCustomer]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    setForm((f) => ({ ...f, customerId: customer.id }));
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
    setForm((f) => ({ ...f, customerId: "" }));
  };

  const handleSubmit = async () => {
    if (!form.customerId || !form.reservationDate) {
      showSnackbar("顧客を選択し、集荷日を入力してください", "error");
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
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">新規集荷注文作成</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <Calendar size={14} className="text-blue-500" /> 集荷予定日
            </label>
            <input type="date" min={today} value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
          </div>

          <div className="space-y-3 relative">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <Search size={14} className="text-blue-500" /> 顧客を検索
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="名前・カナ・電話番号で検索..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedCustomer) setSelectedCustomer(null);
                  setShowSuggestions(true);
                }}
                className={`w-full bg-slate-800/50 border ${selectedCustomer ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-slate-700"} rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 outline-none transition-all pr-12`}
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {fetchingCustomers ? (
                  <Loader2 size={18} className="text-slate-500 animate-spin" />
                ) : selectedCustomer ? (
                  <button onClick={handleClearSelection} className="text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                ) : (
                  <Search size={18} className="text-slate-600" />
                )}
              </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden shadow-black/50 border-t-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto">
                  {suggestions.map((c) => (
                    <button key={c.id} onClick={() => handleSelect(c)} className="w-full text-left px-5 py-4 hover:bg-blue-600/10 border-b border-slate-700/50 last:border-none transition-all group flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-200 font-bold group-hover:text-blue-400 transition-colors">{c.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span className="bg-slate-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{c.kana || "No Kana"}</span>
                          <span>{c.phones?.[0]?.value || "電話なし"}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600 text-right max-w-[150px] truncate font-medium italic">{c.address}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCustomer && (
              <div className="mt-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4 animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-500/20 p-2.5 rounded-xl shrink-0 mt-1">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-emerald-400 font-black text-lg truncate">{selectedCustomer.name}</h4>
                    <span className="text-[10px] font-mono text-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 rounded-full">MATCHED</span>
                  </div>
                  <div className="flex flex-col gap-1 text-slate-400">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <MapPin size={12} className="text-slate-500" />
                      <span className="truncate">{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <Users size={14} className="text-blue-500" /> 配送担当者 (任意)
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
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none cursor-pointer"
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

        <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex gap-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 hover:text-white">
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!selectedCustomer} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 font-black shadow-lg shadow-blue-900/20 disabled:opacity-30">
            注文を確定する
          </Button>
        </div>
        {loading && <LoadingOverlay text="作成中..." />}
      </div>
    </div>
  );
}
