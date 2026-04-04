"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { auth } from "@/lib/firebase";
import { ClipboardDocumentListIcon, HomeIcon, UsersIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { ChartNoAxesCombined, Menu, ShieldCheck, UserIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: HomeIcon as any },
  { label: "集荷一覧", href: "/admin/orders", icon: ClipboardDocumentListIcon as any },
  { label: "顧客一覧", href: "/customers", icon: UsersIcon as any },
  { label: "月次集計", href: "/admin/monthlySummary", icon: ChartNoAxesCombined },
];

export default function Header() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  const onSignOut = async () => {
    setMenuOpen(false);
    await signOut(auth);
    router.push("/signin");
  };

  if (!mounted) return <header className="w-full h-16 bg-white border-b border-gray-100 sticky top-0 z-50" />;

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-1 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="relative w-16 h-14 md:w-20 md:h-17 group-hover:scale-105 transition-transform duration-300">
            <Image src="/spirit.webp" alt="Spirit Logo" fill className="object-contain p-0.5" sizes="80px" priority />
          </div>
          {user?.id && (
            <div className="flex items-center gap-3 py-2 px-3">
              <div className={`p-1.5 rounded-xl shadow-sm ${isAdmin ? "bg-blue-600 text-white" : "bg-slate-600 text-white"}`}>{isAdmin ? <ShieldCheck size={20} /> : <UserIcon size={20} />}</div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{isAdmin ? "管理者" : "ドライバー"}</p>
                <h1 className="text-sm font-black text-slate-800 leading-none">{user?.name}</h1>
              </div>
            </div>
          )}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-slate-500 font-bold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-slate-50 ${isActive ? "text-indigo-600 bg-indigo-50/50" : "hover:text-slate-900"}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
              <button className="ml-4 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-orange-600 transition-all shadow-md active:scale-95" onClick={onSignOut}>
                SIGN OUT
              </button>
            </nav>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-800 active:scale-90 transition-transform">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-in fade-in duration-300" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-500 ease-out" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-1 rounded-lg">
                  <Image src="/spirit.webp" alt="Logo" width={24} height={24} className="brightness-200" />
                </div>
                <span className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">Spirit</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-500 hover:bg-slate-50"}`} onClick={() => setMenuOpen(false)}>
                    <Icon className="w-6 h-6" />
                    <span className="font-black">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button className="w-full mt-auto absolute bottom-8 left-0 px-6" onClick={onSignOut}>
              <div className="py-4 bg-rose-50 text-rose-600 font-black rounded-2xl text-center hover:bg-rose-100 transition-colors">SIGN OUT</div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
