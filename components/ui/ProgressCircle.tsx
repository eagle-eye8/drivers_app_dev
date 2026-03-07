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
  const isComplete = total > 0 && current >= total;

  // サイズ閾値で表示を切り替え（小サイズはコンパクトに）
  const isSmall = size < 80;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* グロー */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${isComplete ? "opacity-25 bg-emerald-400" : total === 0 ? "opacity-0" : "opacity-20 bg-cyan-400"}`} />

      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`grad-progress-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id={`grad-complete-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* レール */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth} />

        {/* 進捗リング */}
        {total > 0 && <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={isComplete ? `url(#grad-complete-${size})` : `url(#grad-progress-${size})`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }} />}
      </svg>

      {/* 中央テキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
        {total === 0 ? (
          // タスクなし
          <span style={{ fontSize: size * 0.16 }} className="font-bold text-slate-300">
            —
          </span>
        ) : isSmall ? (
          // 小サイズ: 分数のみ（シンプル）
          <div className="flex items-baseline" style={{ gap: size * 0.02 }}>
            <span style={{ fontSize: size * 0.28, lineHeight: 1 }} className={`font-black tabular-nums ${isComplete ? "text-emerald-500" : "text-slate-800"}`}>
              {current}
            </span>
            <span style={{ fontSize: size * 0.16 }} className="font-bold text-slate-400">
              /{total}
            </span>
          </div>
        ) : (
          // 大サイズ: 分数 ＋ パーセント
          <>
            {/* 分数（メイン） */}
            <div className="flex items-baseline" style={{ gap: size * 0.015 }}>
              <span style={{ fontSize: size * 0.22, lineHeight: 1 }} className={`font-black tabular-nums tracking-tight ${isComplete ? "text-emerald-500" : "text-slate-800"}`}>
                {current}
              </span>
              <span style={{ fontSize: size * 0.13 }} className="font-bold text-slate-400 mb-px">
                /
              </span>
              <span style={{ fontSize: size * 0.16, lineHeight: 1 }} className="font-bold text-slate-500 tabular-nums">
                {total}
              </span>
            </div>
            {/* パーセント（サブ） */}
            <span style={{ fontSize: size * 0.11, marginTop: size * 0.03 }} className={`font-semibold tabular-nums transition-colors duration-500 ${isComplete ? "text-emerald-400" : "text-cyan-500"}`}>
              {percentage}%
            </span>
          </>
        )}
      </div>

      {/* 完了バッジ（大サイズのみ） */}
      {isComplete && !isSmall && (
        <div className="absolute -bottom-1 bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full shadow-md animate-bounce" style={{ fontSize: size * 0.075 }}>
          DONE
        </div>
      )}
    </div>
  );
}
