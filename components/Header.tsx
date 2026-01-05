"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";

// Heroicons
import { HomeIcon, ClipboardDocumentListIcon, UserIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "./ui/button";
import CreateOrderModal from "./orders/CreateOrderModal";

// NavItem 型
type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// NavItems
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { label: "集荷リスト", href: "/admin/orders", icon: ClipboardDocumentListIcon },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsub();
  }, []);

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-6">
        <div className="text-xl font-semibold text-gray-700">Spirit</div>
        {/* Sign Out */}
        {user ? (
          <button onClick={() => signOut(auth)} className="hidden md:block px-4 py-2 text-gray rounded hover:bg-gray-300 border-1">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 mr-1" />
              {`${user.displayName}でログイン中`}
            </div>
          </button>
        ) : (
          <a href="/signin" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            サインイン
          </a>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* PCナビ */}
        {user && (
          <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 pb-1
                    hover:text-gray-900 transition
                    ${isActive ? "text-gray-900 font-semibold border-b-2 border-gray-900" : ""}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-600"}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        )}
        {/* ハンバーガー（スマホ） */}
        {user && (
          <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded hover:bg-gray-100">
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-gray-600"></span>
              <span className="block w-6 h-0.5 bg-gray-600"></span>
              <span className="block w-6 h-0.5 bg-gray-600"></span>
            </div>
          </button>
        )}
      </div>

      {/* スライドメニュー（スマホ） */}
      {menuOpen && user && (
        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold mb-6">Menu</div>

            <nav className="flex flex-col gap-4 text-gray-700">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 hover:text-gray-900
                      ${isActive ? "text-gray-900 font-semibold" : ""}
                    `}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "text-gray-900" : "text-gray-600"}`} />
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <button className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700" onClick={() => signOut(auth)}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
