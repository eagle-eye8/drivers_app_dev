// components/employees/EmployeeEditDialog.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { mutate } from "swr";
import { BaseDialog } from "../ui/BaseDialog";

type Props = {
  employee: any;
  onClose: () => void;
};

export function EmployeeEditDialog({ open, onClose, employee }: any) {
  async function handleSave() {
    await fetch(`/api/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });

    mutate("/api/dashboard");
    onClose();
  }

  return (
    <BaseDialog open={open} onClose={onClose} title="従業員編集">
      <button onClick={handleSave}>保存</button>
    </BaseDialog>
  );
}
// export function EmployeeEditDialog({ employee, onClose }: Props) {
//   const [name, setName] = useState(employee.name ?? "");
//   const [role, setRole] = useState(employee.role ?? "");
//   const [active, setActive] = useState(employee.active ?? true);
//   const [saving, setSaving] = useState(false);

//   async function handleSave() {
//     setSaving(true);

//     await fetch(`/api/employees/${employee.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name,
//         role,
//         active,
//       }),
//     });

//     setSaving(false);
//     onClose();
//   }

//   return (
//     <Dialog open onClose={onClose} className="fixed inset-0 z-50">
//       {/* backdrop */}
//       <div className="fixed inset-0 bg-black/30" />

//       {/* panel */}
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
//           <Dialog.Title className="text-lg font-semibold mb-4">
//             従業員編集
//           </Dialog.Title>

//           {/* 名前 */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">名前</label>
//             <input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full rounded border px-3 py-2 text-sm"
//             />
//           </div>

//           {/* 役割 */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">役割</label>
//             <input
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="w-full rounded border px-3 py-2 text-sm"
//             />
//           </div>

//           {/* active */}
//           <div className="mb-6 flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={active}
//               onChange={(e) => setActive(e.target.checked)}
//             />
//             <span className="text-sm">アクティブ</span>
//           </div>

//           {/* actions */}
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-sm rounded border"
//             >
//               キャンセル
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
//             >
//               保存
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }
