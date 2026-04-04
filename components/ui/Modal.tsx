'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type Field = {
  label: string;
  name: string;
  type: 'text' | 'number' | 'tel'| 'textarea';
  placeholder?: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fields: Field[];
  initialData?: any; // これがあれば「更新」、なければ「新規」
  onSave: (data: any) => void;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSave,
}: ModalProps) {
  const [formData, setFormData] = useState({});


  useEffect(() => {
    setFormData(initialData || {});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData?.id; // IDがあれば編集モード

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // 内側のクリックでは閉じない
      >
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {title || (isEdit ? '情報を編集' : '新規登録')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 自動生成フォーム */}
        <div className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name as keyof typeof formData] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name as keyof typeof formData] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-xl transition">
            キャンセル
          </button>
          <button 
            onClick={() => onSave(formData)}
            className={`px-6 py-2 text-white font-bold rounded-xl shadow-lg transition active:scale-95 ${
              isEdit ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isEdit ? '更新する' : '登録する'}
          </button>
        </div>
      </div>
    </div>
  );
}
