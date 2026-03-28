"use client";

import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { Navigation, Phone, MapPin, TrendingUp, Check, Copy, Package } from "lucide-react";
import { CopyButton } from "../ui/CopyButton";

interface OrderCardProps {
  order: OrderWithCustomer;
  onPickup: (order: OrderWithCustomer) => void;
}

export default function OrderCard({ order, onPickup }: OrderCardProps) {
  const isCompleted = order.status === "completed";
  const totalQty = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) ?? 0;

  const handleNavigate = () => {
    const addr = order.customer?.address;
    if (!addr) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`);
  };

  return (
    <div className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-all duration-500 ${isCompleted ? "opacity-40 grayscale bg-gray-50 border-transparent" : "border-white shadow-blue-100/50"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">ID: {order.id.slice(-4)}</span>
            <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-full font-bold text-blue-600 flex items-center gap-1">
              <Package size={10} /> {totalQty} 個
            </span>
            {(order.amount ?? 0) > 0 && (
              <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={10} />¥{order.amount.toLocaleString()}
              </span>
            )}
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 leading-tight">{order.customer?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400 flex items-center gap-1 font-medium mt-1">
              <MapPin size={12} className="text-blue-500" />
              {order.customer?.address}
            </p>
            <CopyButton value={order.customer?.address} />
          </div>
        </div>
        <button onClick={handleNavigate} className={`p-3 rounded-2xl transition-all active:scale-90 ${isCompleted ? "bg-gray-200 text-gray-400" : "bg-blue-50 text-blue-600"}`}>
          <Navigation size={20} />
        </button>
      </div>
      <div className="flex gap-2">
        <button disabled={isCompleted} onClick={() => onPickup(order)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${isCompleted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white shadow-lg shadow-gray-200"}`}>
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2">
              <Check size={16} /> 完了済み
            </div>
          ) : (
            "集荷を開始する"
          )}
        </button>
        {order.customer?.phone && !isCompleted && (
          <a href={`tel:${order.customer.phone}`} className="p-4 bg-gray-100 text-gray-500 rounded-2xl active:bg-gray-200 transition-colors">
            <Phone size={20} />
          </a>
        )}
      </div>
    </div>
  );
}
