"use client";

import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Check, MapPin, Navigation, Package, Phone, TrendingUp } from "lucide-react";
import { CopyButton } from "../ui/CopyButton";

interface OrderCardProps {
  order: OrderWithCustomer;
  onPickup: (order: OrderWithCustomer) => void;
}

export default function OrderCard({ order, onPickup }: OrderCardProps) {
  const isCompleted = order.status === "completed";
  const totalQty = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) ?? 0;

  const mainPhone = order.customer?.phones?.[0]?.value;

  const handleNavigate = () => {
    const loc = order.customer?.location;
    const addr = order.customer?.address;

    let url = "";
    if (loc?.lat && loc?.lng) {
      // 緯度経度がある場合
      url = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
    } else if (addr) {
      // 住所のみの場合
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    }

    if (url) window.open(url, "_blank");
  };

  return (
    <div className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all duration-500 ${isCompleted ? "opacity-40 grayscale bg-gray-50 border-transparent" : "border-white shadow-blue-100/50"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {order.customer?.kana && <span className="text-[9px] py-0.5 rounded-full font-black text-slate-500 uppercase tracking-tighter shrink-0">{order.customer.kana}</span>}
            <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-full font-bold text-blue-600 flex items-center gap-1 shrink-0">
              <Package size={10} /> {totalQty} 個
            </span>
            {(order.amount ?? 0) > 0 && (
              <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                <TrendingUp size={10} />¥{order.amount?.toLocaleString()}
              </span>
            )}
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 leading-tight">{order.customer?.name || "名前なし"}</h2>
          <div className="flex items-center gap-2 mt-1 group">
            <p className="text-xs text-gray-400 flex items-center gap-1 font-medium truncate max-w-[200px]">
              <MapPin size={12} className="text-blue-500 shrink-0" />
              {order.customer?.address || "住所不明"}
            </p>
            {order.customer?.address && <CopyButton value={order.customer.address} />}
          </div>
          {mainPhone && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono font-bold tracking-wider">
                <Phone size={12} className="text-emerald-500 shrink-0" />
                {mainPhone}
              </p>
              <CopyButton value={mainPhone.replace(/[-\s]/g, "")} />
            </div>
          )}
        </div>
        <button onClick={handleNavigate} disabled={!order.customer?.address && !order.customer?.location} className={`p-3 rounded-2xl transition-all active:scale-90 shadow-sm ${isCompleted ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200"}`} title="Googleマップで開く">
          <Navigation size={20} fill={isCompleted ? "none" : "currentColor"} fillOpacity={0.2} />
        </button>
      </div>
      <div className="flex gap-2">
        <button disabled={isCompleted} onClick={() => onPickup(order)} className={`flex-[3] py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${isCompleted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-black"}`}>
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2">
              <Check size={16} /> 完了済み
            </div>
          ) : (
            "集荷を開始する"
          )}
        </button>
      </div>
    </div>
  );
}
