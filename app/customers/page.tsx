"use client";

import CustomerModal from "@/components/customers/CustomerModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useSnackbar } from "@/components/ui/SnackbarProvider";
import { Customer } from "@/types/customer";
import { Clock, Edit2, Mail, MapPin, Search, Trash2, User, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showSnackbar } = useSnackbar();

  const fetchCustomers = async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      showSnackbar("顧客データの読み込みに失敗しました。", "error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase().replace(/-/g, "");
    if (!query) return customers;
    return customers.filter((c) => c.searchIndex?.includes(query));
  }, [customers, searchQuery]);

  const handleCreateOpen = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeletingId(customer.id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSnackbar("顧客情報を削除しました。", "success");
      await fetchCustomers();
    } catch (error) {
      showSnackbar("削除に失敗しました。", "error");
    } finally {
      setIsLoading(false);
      setDeletingId(null);
      setIsConfirmOpen(false);
    }
  };

  const handleSave = async (formData: any) => {
    const isEdit = !!selectedCustomer;
    const url = isEdit ? `/api/customers/${selectedCustomer.id}` : "/api/customers";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      showSnackbar(isEdit ? "顧客情報を更新しました" : "新規登録しました", "success");
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showSnackbar("保存に失敗しました", "error");
    }
  };

  if (isFetching) return <LoadingOverlay text="顧客情報取得中..." />;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans text-slate-900">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 py-4 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">顧客一覧</h1>
                <p className="text-xs font-bold text-slate-400">顧客数: {filteredCustomers.length} 件</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="名前・カナ・電話番号で検索..." className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none text-sm font-semibold shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={handleCreateOpen} className="bg-slate-900 text-white p-3 md:px-6 md:py-3 rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                <UserPlus size={18} />
                <span className="font-bold text-sm hidden md:inline">新規登録</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto px-2 py-4 md:px-8 md:py-8">
        {filteredCustomers.length > 0 ? (
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="pl-6 md:pl-10 pr-4 py-6 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[110px] md:min-w-[200px]">名前</th>
                    <th className="hidden lg:table-cell px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">連絡先一覧</th>
                    <th className="hidden lg:table-cell px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">住所</th>
                    <th className="lg:hidden px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">連絡先・住所</th>
                    <th className="hidden sm:table-cell px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">最終更新日</th>
                    <th className="pr-6 md:pr-10 pl-4 py-6 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">編集・削除</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="pl-6 md:pl-10 pr-4 py-7 min-w-[110px] md:min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-[9px] md:text-[10px] font-black text-blue-500 mb-1.5 tracking-tighter uppercase leading-none">{c.kana || "NO KANA"}</span>
                          <span className="text-[10px] md:text-lg font-bold text-slate-900 leading-none whitespace-nowrap">{c.name}</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-7">
                        <div className="flex flex-col gap-2.5">
                          {c.phones?.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 group/phone">
                              <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 w-14 text-center uppercase shrink-0">{p.label}</span>
                              <span className="text-sm font-mono font-bold text-slate-800 tracking-tight">{p.value}</span>
                              <div className="opacity-0 group-hover/phone:opacity-100 transition-opacity">
                                <CopyButton value={p.value} />
                              </div>
                            </div>
                          ))}
                          {c.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold ml-1 pt-1 border-t border-slate-50">
                              <Mail size={12} className="text-slate-300" />
                              {c.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-7">
                        <div className="flex flex-col gap-1.5">
                          <a href={c.location?.lat && c.location?.lng ? `https://www.google.com/maps/search/?api=1&query=${c.location.lat},${c.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-blue-600 font-bold hover:underline leading-relaxed max-w-[250px]">
                            <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <span>{c.address}</span>
                          </a>
                          {c.location?.lat && c.location?.lng && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {`(${c.location.lat.toFixed(6)}, ${c.location.lng.toFixed(6)})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="lg:hidden px-4 py-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            {c.phones?.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase">{p.label}</span>
                                <span className="text-xs font-bold font-mono text-slate-800">{p.value}</span>
                                <CopyButton value={p.value} />
                              </div>
                            ))}
                          </div>
                          <a href={c.location?.lat && c.location?.lng ? `https://www.google.com/maps/search/?api=1&query=${c.location.lat},${c.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1 text-blue-600 font-bold">
                            <MapPin size={12} className="mt-0.5 shrink-0" />
                            <span className="text-[11px] underline underline-offset-2 line-clamp-1">{c.address}</span>
                          </a>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-7">
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <Clock size={15} className="text-slate-200" />
                          <span className="text-sm font-bold tracking-tighter">{c.updatedAt}</span>
                        </div>
                      </td>
                      <td className="pr-6 md:pr-10 pl-4 py-5 md:py-7 text-center">
                        <div className="flex justify-center items-center gap-2 md:gap-3 transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 opacity-100">
                          <button onClick={() => handleEditOpen(c)} className="p-2.5 md:px-3 md:py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all font-bold text-xs border border-emerald-100 shadow-sm active:scale-95 flex items-center gap-1.5">
                            <Edit2 size={16} className="md:w-[14px] md:h-[14px]" />
                            <span className="hidden lg:inline">編集</span>
                          </button>
                          <button onClick={() => handleDeleteClick(c)} className="p-2.5 md:px-3 md:py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all font-bold text-xs border border-red-100 shadow-sm active:scale-95 flex items-center gap-1.5">
                            <Trash2 size={16} className="md:w-[14px] md:h-[14px]" />
                            <span className="hidden lg:inline">削除</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-20 md:py-40 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
            <Search size={48} className="text-slate-200 mb-4" />
            <h3 className="text-slate-900 font-black text-lg">顧客がいません</h3>
          </div>
        )}
      </main>
      {isModalOpen && <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={selectedCustomer} />}
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="顧客データの削除" message={`「${selectedCustomer?.name}」様のデータを削除します。`} confirmLabel="削除する" isDanger />
      {isLoading && <LoadingOverlay text="顧客削除中..." />}
    </div>
  );
}
