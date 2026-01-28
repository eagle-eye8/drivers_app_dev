"use client";

import { useState, useEffect, useMemo } from "react";
import { Edit2, Trash2, Phone, MapPin, Mail, Search, UserPlus } from "lucide-react";
import { Customer } from "@/types/customer";
import Modal from "@/components/ui/Modal";
import { useSnackbar } from "@/components/ui/SnackbarProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

const customerFields: any[] = [
  { label: "名前", name: "name", type: "text" },
  { label: "フリガナ", name: "kana", type: "text" },
  { label: "電話番号", name: "phone", type: "tel" },
  { label: "住所", name: "address", type: "textarea" },
];

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState(""); // 検索用ステート
  const { showSnackbar } = useSnackbar();

  // 1. データの取得
  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      showSnackbar("データの読み込みに失敗しました。", "error");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. 検索フィルタリングロジック（メモ化して最適化）
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase().replace(/-/g, "");
    if (!query) return customers;

    return customers.filter((c) => {
      const phone = (c.phone || "").replace(/-/g, "");
      const name = (c.name || "").toLowerCase();
      const kana = (c.kana || "").toLowerCase();
      return phone.includes(query) || name.includes(query) || kana.includes(query);
    });
  }, [customers, searchQuery]);

  // --- ハンドラー関連 ---
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
    setIsLoading(true);
    const isEdit = !!selectedCustomer?.id;
    const url = isEdit ? `/api/customers/${selectedCustomer.id}` : "/api/customers";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      showSnackbar(isEdit ? "更新しました。" : "登録しました。", "success");
      setIsModalOpen(false);
      await fetchCustomers();
    } catch (error) {
      showSnackbar("保存に失敗しました。", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* サービスヘッダー (Sticky) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              顧客管理システム
              <span className="text-sm font-normal text-gray-400">({filteredCustomers.length}件)</span>
            </h1>
            
            <div className="flex items-center gap-2">
              {/* 検索バー */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="名前・電話番号で検索..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* 追加ボタン */}
              <button 
                onClick={handleCreateOpen}
                className="bg-blue-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
              >
                <UserPlus size={20} />
                <span className="hidden sm:inline font-medium">新規追加</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 md:px-8">
        {filteredCustomers.length > 0 ? (
          <>
            {/* --- PC表示: テーブル --- */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">顧客情報</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">連絡先</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">住所</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{c.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-gray-300" />{c.phone}</div>
                        <div className="flex items-center gap-2 mt-1"><Mail size={14} className="text-gray-300" />{c.email || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin size={14} className="mt-1 shrink-0 text-gray-300" />
                          <span className="line-clamp-2">{c.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditOpen(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteClick(c)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- スマホ表示: カード形式 --- */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredCustomers.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-blue-500 font-medium">{c.kana}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditOpen(c)} className="p-2.5 bg-gray-50 text-blue-600 rounded-xl active:scale-95 transition"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteClick(c)} className="p-2.5 bg-gray-50 text-red-600 rounded-xl active:scale-95 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400" />{c.phone || "未登録"}</div>
                    {c.email && <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400" />{c.email}</div>}
                    <div className="flex items-start gap-3"><MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />{c.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">該当する顧客が見つかりません</h3>
            <p className="text-gray-500 text-sm mt-1">別のキーワードで試してみてください</p>
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fields={customerFields} initialData={selectedCustomer} onSave={handleSave} />
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="顧客の削除" message={`${selectedCustomer?.name} 様の情報を完全に削除します。よろしいですか？`} confirmLabel="削除する" isDanger={true} />
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
