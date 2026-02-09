"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // Imageコンポーネントを追加
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation"; // useRouterを追加
import { HomeIcon, ClipboardDocumentListIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers/AuthProvider";
import { ShieldCheck, UserIcon } from "lucide-react";

// NavItem 型の定義を修正（ComponentTypeを使用）
type NavItem = {
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string }>;
};

const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: HomeIcon },
  { label: "集荷一覧", href: "/admin/orders", icon: ClipboardDocumentListIcon },
  { label: "顧客一覧", href: "/customers", icon: UsersIcon },
];

export default function Header() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // 遷移用

  if (loading) return null;

  const onSignOut = () => {
    signOut(auth);
    router.push("/signin");
  };

  return (
    <header className="w-full flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push("/admin/dashboard")}>
          <div className="flex items-center gap-6 group cursor-pointer">
            {/* <div className="relative w-17 h-13 overflow-hidden rounded-xl shadow-inner border border-slate-100 transition-all group-hover:shadow-md group-hover:scale-105"> */}
            <div className="relative w-20 h-17    group-hover:scale-105">
              <Image src="/spirit.webp" alt="Spirit Logo" fill className="object-cover p-0.5" />
            </div>
            <div className="flex items-center gap-3 py-4">
              {/* アイコン部分 */}
              <div className={`p-1 rounded-2xl shadow-sm ${isAdmin ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-600 border border-slate-100"}`}>{isAdmin ? <ShieldCheck size={32} strokeWidth={2.5} /> : <UserIcon size={32} strokeWidth={2.5} />}</div>
              {/* テキスト部分 */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{isAdmin ? "Administrator" : "Staff Member"}</p>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                  <span className="text-blue-500">{user?.name}</span>
                </h1>
              </div>
            </div>
            {/* テキスト部分：Gemini風スタイリング */}
            {/* <div className="font-outfit text-2xl font-semibold tracking-[-0.02em] flex items-baseline">
              <span className="text-slate-800">Spi</span>
              <span className="text-slate-800">rit</span>
              {/* 最後にGemini風のキラキラ（ドット）を添えるとさらにおしゃれ
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500"></span>
            </div> */}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* PCナビ */}
        {user && (
          <nav className="hidden md:flex items-center gap-8 text-slate-600 font-bold">
            {navItems.map((item) => {
              const Icon = item.icon; // 変数に代入
              const isActive = pathname.startsWith(item.href);
              return (
                <a key={item.href} href={item.href} className={`flex items-center gap-2 py-1 transition-all hover:text-indigo-600 border-b-2 ${isActive ? "text-indigo-600 border-indigo-600" : "border-transparent"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </a>
              );
            })}
            <button className="ml-4 px-5 py-2 bg-slate-800 text-white text-xs font-black rounded-full hover:bg-slate-700 transition shadow-lg shadow-slate-200 active:scale-95" onClick={() => onSignOut()}>
              SIGN OUT
            </button>
          </nav>
        )}

        {/* ハンバーガー（スマホ） */}
        {user?.role === "admin" && (
          <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-slate-800 rounded-full"></span>
              <span className="block w-4 h-0.5 bg-slate-800 rounded-full"></span>
              <span className="block w-6 h-0.5 bg-slate-800 rounded-full"></span>
            </div>
          </button>
        )}
      </div>

      {/* スライドメニュー（スマホ）省略せず実装 */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-8 shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-100">
              <Image src="/spirit.webp" alt="Logo" width={32} height={32} className="rounded-lg shadow" />
              <span className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">Spirit</span>
            </div>

            <nav className="flex flex-col gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <a key={item.href} href={item.href} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`} onClick={() => setMenuOpen(false)}>
                    <Icon className="w-6 h-6" />
                    <span className="font-bold">{item.label}</span>
                  </a>
                );
              })}
            </nav>
            <button
              className="w-full mt-12 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
              onClick={() => {
                onSignOut();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
