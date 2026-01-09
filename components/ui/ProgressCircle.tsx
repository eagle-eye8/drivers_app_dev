"use client";

import React from "react";

type Props = {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export default function ProgressCircle({ current, total, size = 120, strokeWidth = 10, label }: Props) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // 進捗に応じて色を変える（やる気アップ！）
  const getColor = () => {
    if (percentage === 100) return "stroke-emerald-500";
    if (percentage > 50) return "stroke-blue-500";
    return "stroke-orange-500";
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 背景の円 */}
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100" />
          {/* 進捗の円 */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease-in-out" }} strokeLinecap="round" className={`${getColor()} drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
        </svg>
        {/* 真ん中のテキスト */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800">{percentage}%</span>
          {label && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-600">
        <span className="text-gray-900 font-bold">{current}</span> / {total} Tasks
      </div>
    </div>
  );
}
