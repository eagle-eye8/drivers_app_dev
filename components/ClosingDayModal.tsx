"use client";

import { useParams } from "next/navigation";
import Modal from "./ui/Modal";
import { useSnackbar } from "./ui/SnackbarProvider";
import { getJstDateString } from "@/lib/utils/date";

interface ClosingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // 保存成功後のコールバック（リスト更新など）
}

export default function ClosingDayModal({ isOpen, onClose, onSuccess }: ClosingDayModalProps) {
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const { showSnackbar } = useSnackbar();

  const handleSave = async (formData: any) => {
    // 日付の取得
      const today = getJstDateString();
    
    // 保存用データの構築
    const expenses = [
      { category: "ガソリン代", amount: Number(formData.gas) || 0 },
      { category: "その他", amount: Number(formData.other) || 0, memo: formData.memo },
    ];

    try {
      const response = await fetch("/api/daily-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          date: today,
          expenses: expenses,
        }),
      });

      if (!response.ok) throw new Error("保存に失敗しました");
showSnackbar("業務終了報告を保存しました。", "success");
      alert("");
      onClose();
      onSuccess();
    } catch (error) {
      showSnackbar("業務終了報告を保存できませんでした。", "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="業務終了報告"
      fields={[
        { label: "ガソリン代 (円)", name: "gas", type: "tel", placeholder: "0" },
        { label: "その他 (円)", name: "other", type: "tel", placeholder: "0" },
        { label: "その他の詳細", name: "memo", type: "textarea", placeholder: "駐車場代や高速道路料金など" },
      ]}
      onSave={handleSave}
    />
  );
}
