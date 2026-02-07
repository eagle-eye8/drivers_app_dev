"use client";

type Props = {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
};

export default function ProgressCircle({ current, total, size = 120, strokeWidth = 12 }: Props) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 1. 背景の強力なグロー（発光感） */}
      <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 opacity-30 ${percentage === 100 ? "bg-lime-400" : "bg-cyan-400"}`} />

      <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* 明るいネオン・シアンからブルーへのグラデーション */}
          <linearGradient id="brightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" /> {/* cyan-400 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
          </linearGradient>
          {/* 完遂時のネオン・ライム */}
          <linearGradient id="glowSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a3e635" /> {/* lime-400 */}
            <stop offset="100%" stopColor="#22c55e" /> {/* green-500 */}
          </linearGradient>
        </defs>

        {/* 背景レール（より明るい白に近いグレー） */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />

        {/* 進捗リング：発色の良いグラデーション */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={percentage === 100 ? "url(#glowSuccess)" : "url(#brightGradient)"} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }} className="drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
      </svg>

      {/* --- 中央テキスト：数字と％を力強く強調 --- */}
      <div className="absolute inset-0 flex items-center justify-center leading-none">
        <div className="flex items-center">
          <span className="text-1xl text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">{percentage}</span>
          {/* ％を大きく、色を付けてはっきりと */}
          <span className={`text-xs font-black ml-0.5 mt-1 transition-colors duration-500 ${percentage === 100 ? "text-lime-500" : "text-cyan-500"}`}>%</span>
        </div>
      </div>

      {/* 完了メッセージ（リッチ版） */}
      {percentage === 100 && <div className="absolute bottom-1 bg-lime-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">COMPLETE!</div>}
    </div>
  );
}
