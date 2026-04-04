"use client";

import Modal from "./ui/Modal";
import { useSnackbar } from "./ui/SnackbarProvider";
import { getJstDateString } from "@/lib/utils/date";
import { SigninUser } from "@/types/signinUser";

interface ClosingDayModalProps {
  user: SigninUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // 保存成功後のコールバック（リスト更新など）
}

export default function ClosingDayModal({ isOpen, onClose, onSuccess, user }: ClosingDayModalProps) {
  const { showSnackbar } = useSnackbar();
  
  const handleSave = async (formData: any) => {
    const today = getJstDateString();

    // 保存用データの構築
    const expenses = [
      { category: "ガソリン代", amount: Number(formData.gas) || 0 },
      { category: "その他", amount: Number(formData.other) || 0, memo: formData.memo },
    ];

    try {
      const res = await fetch("/api/daily-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user,
          date: today,
          expenses: expenses,
        }),
      });

      showSnackbar("業務終了報告を保存しました。", "success");
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
        { label: "ガソリン代 (円)", name: "gas", type: "number", placeholder: "0" },
        { label: "その他 (円)", name: "other", type: "number", placeholder: "0" },
        { label: "その他の詳細", name: "memo", type: "text", placeholder: "駐車場代や高速道路料金など" },
      ]}
      onSave={handleSave}
    />
  );
}
