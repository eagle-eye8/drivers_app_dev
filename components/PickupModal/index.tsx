"use client";

import prices from "@/lib/constants/priceTable/shippingPrices.json";
import { calculateItemFee } from "@/lib/utils/calculateItemFee";
import { Package, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSnackbar } from "../ui/SnackbarProvider";

import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { AreaGroupKey, KindType } from "@/types/pickup";
import { AreaSelector } from "./AreaSelector";
import { CartList } from "./CartList";
import { ItemForm } from "./ItemForm";

export interface CartItem {
  kind: KindType;
  to: string;
  size: number | null;
  quantity: number;
  subtotal: number;
}

interface PickupModalProps {
  order: OrderWithCustomer;
  onClose: () => void;
  onSuccess: () => void;
}
const SIZE_OPTIONS_MAP = Object.fromEntries(Object.entries(prices.v2026_01).map(([key, group]: [any, any]) => [key, { normal: Object.keys(group.normal ?? {}), chilled: Object.keys(group.chilled ?? {}) }]));

export function PickupModal({ order, onClose, onSuccess }: PickupModalProps) {
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<AreaGroupKey>("tohoku_kanto");
  const [searchQuery, setSearchQuery] = useState("");
  const [kind, setKind] = useState<KindType>("normal");
  const [size, setSize] = useState<number>(60);
  const [quantity, setQuantity] = useState(1);

  const sizeOptions = useMemo(() => SIZE_OPTIONS_MAP[selectedGroup]?.[kind === "chilled" ? "chilled" : "normal"] ?? [], [selectedGroup, kind]);

  const addItem = useCallback(() => {
    const groupLabel = prices.v2026_01[selectedGroup].label;
    const feeInfo = calculateItemFee({ kind, to: groupLabel, size: kind === "heavy" ? null : size, quantity });
    if (feeInfo.error) return showSnackbar("計算エラー", "error");

    setItems((prev) => [...prev, { kind, to: groupLabel, size: kind === "heavy" ? null : size, quantity, subtotal: feeInfo.subtotal }]);
    setQuantity(1);
    if ("vibrate" in navigator) navigator.vibrate(10);
  }, [selectedGroup, kind, size, quantity, showSnackbar]);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, status: "completed" }),
      });
      if (!res.ok) throw new Error();
      showSnackbar("集荷完了を登録しました", "success");
      onSuccess();
      onClose();
    } catch {
      showSnackbar("失敗しました", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center p-0 md:p-6 lg:p-10">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl bg-slate-900 rounded-none md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/50">
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
            <div className="bg-cyan-500 p-1.5 rounded-lg text-white">
              <Package size={20} />
            </div>{" "}
            集荷登録
          </h1>
          <button onClick={onClose} className="p-3 bg-slate-800 rounded-2xl text-slate-400">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10">
            <div className="space-y-6">
              <AreaSelector selectedGroup={selectedGroup} onGroupSelect={setSelectedGroup} searchQuery={searchQuery} onSearch={setSearchQuery} />
              <ItemForm kind={kind} setKind={setKind} size={size} setSize={setSize} sizeOptions={sizeOptions} quantity={quantity} setQuantity={setQuantity} onAdd={addItem} />
            </div>
            <CartList items={items} onRemove={(i) => setItems((prev) => prev.filter((_, idx) => idx !== i))} totalFee={items.reduce((s, i) => s + i.subtotal, 0)} onComplete={handleComplete} submitting={submitting} />
          </div>
        </div>
      </div>
    </div>
  );
}
