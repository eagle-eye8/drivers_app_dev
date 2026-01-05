// components/dashboard/StaffSummary.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { EmployeeEditDialog } from "@/components/employees/EmployeeEditDialog";

export function StaffSummary({ employees, countByAssigned }: any) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className="border rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">スタッフ</h2>
        <Link href="/admin/employees" className="text-sm text-blue-600">
          一覧へ
        </Link>
      </div>

      <div className="space-y-2">
        {employees.map((e: any) => (
          <div
            key={e.id}
            onClick={() => setSelected(e)}
            className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="font-semibold">{e.name}</div>
            <div className="text-xs text-gray-500">
              担当 {countByAssigned[e.id] || 0} 件
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <EmployeeEditDialog
          employee={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
