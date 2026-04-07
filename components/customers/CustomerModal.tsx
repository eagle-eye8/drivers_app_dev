"use client";

import { Customer, PHONE_LABELS } from "@/types/customer";
import { Edit, Globe, Hash, Mail, MapPin, Phone, Trash2, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSnackbar } from "../ui/SnackbarProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Customer | null;
}

export default function CustomerModal({ isOpen, onClose, onSave, initialData }: Props) {
  const { showSnackbar } = useSnackbar();
  const [name, setName] = useState("");
  const [kana, setKana] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" });
  const [phones, setPhones] = useState([{ label: "携帯", value: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setKana(initialData.kana || "");
      setEmail(initialData.email || "");
      setAddress(initialData.address || "");
      setLocation({
        lat: initialData.location?.lat?.toString() || "",
        lng: initialData.location?.lng?.toString() || "",
      });
      setPhones(initialData.phones && initialData.phones.length > 0 ? initialData.phones : [{ label: "携帯", value: "" }]);
    } else {
      setName("");
      setKana("");
      setEmail("");
      setAddress("");
      setLocation({ lat: "", lng: "" });
      setPhones([{ label: "携帯", value: "" }]);
    }
  }, [initialData, isOpen]);

  const addPhoneField = () => setPhones([...phones, { label: "携帯", value: "" }]);
  const removePhoneField = (index: number) => {
    if (phones.length <= 1) return;
    setPhones(phones.filter((_, i) => i !== index));
  };
  const updatePhone = (index: number, field: "label" | "value", val: string) => {
    const newPhones = [...phones];
    (newPhones[index] as any)[field] = val;
    setPhones(newPhones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showSnackbar("お名前を入力してください", "error");
      return;
    }
    if (!kana.trim()) {
      showSnackbar("カナを入力してください", "error");
      return;
    }
    if (!address.trim()) {
      showSnackbar("住所を入力してください", "error");
      return;
    }
    const hasInvalidPhone = phones.some((p) => p.value && !/^[0-9]+$/.test(p.value.replace(/[-]/g, "")));
    if (hasInvalidPhone) {
      showSnackbar("電話番号は数字で入力してください", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      await onSave({ name, kana, email, address, phones, location });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Edit size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{initialData ? "顧客情報を編集" : "新規顧客登録"}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all group">
            <X size={20} className="text-slate-500 group-hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 氏名 & カナ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <User size={12} className="text-blue-500" /> 氏名
              </label>
              <input required className="w-full px-4 py-2.5 bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 text-white outline-none font-bold text-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Hash size={12} className="text-blue-500" /> フリガナ
              </label>
              <input className="w-full px-4 py-2.5 bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 text-white outline-none font-bold text-sm" value={kana} onChange={(e) => setKana(e.target.value)} />
            </div>
            {/* メール */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Mail size={12} className="text-blue-500" /> メールアドレス
              </label>
              <input type="email" className="w-full px-4 py-2.5 bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 text-white outline-none font-bold text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {/* 電話番号 (複数) */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Phone size={12} className="text-blue-500" /> 電話番号
              </label>
              <div className="space-y-3">
                {phones.map((phone, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select className="w-24 px-2 py-2.5 bg-slate-800 border border-slate-800 rounded-xl font-bold text-[11px] text-blue-500 outline-none appearance-none text-center" value={phone.label} onChange={(e) => updatePhone(index, "label", e.target.value)}>
                      {PHONE_LABELS.map((label, i) => (
                        <option key={i} value={label} className="text-align-center">
                          {label}
                        </option>
                      ))}
                    </select>
                    <input type="tel" className="flex-1 px-4 py-2.5 bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 text-white outline-none font-bold text-sm" placeholder="09012345678" value={phone.value} onChange={(e) => updatePhone(index, "value", e.target.value)} />
                    <button type="button" onClick={() => removePhoneField(index)} className="p-2.5 text-slate-600 hover:text-red-500 transition-all">
                      <Trash2 size={18} className="text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPhoneField} className="w-full py-2 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-bold text-[10px] hover:text-blue-500 transition-all">
                  番号を追加
                </button>
              </div>
            </div>
            {/* 住所 */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <MapPin size={12} className="text-blue-500" /> 住所
              </label>
              <textarea required rows={2} className="w-full px-4 py-2.5 bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 text-white outline-none font-bold text-sm resize-none" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            {/* 緯度経度 */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* 緯度 (LAT) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Globe size={10} className="text-emerald-500" /> 緯度 (LAT)
                </label>
                <input type="text" inputMode="decimal" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-emerald-500" value={location.lat} onChange={(e) => setLocation({ ...location, lat: e.target.value })} />
              </div>
              {/* 経度 (LNG) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Globe size={10} className="text-emerald-500" /> 経度 (LNG)
                </label>
                <input type="text" inputMode="decimal" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-emerald-500" value={location.lng} onChange={(e) => setLocation({ ...location, lng: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs hover:text-white transition-all">
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all">
              {isSubmitting ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
