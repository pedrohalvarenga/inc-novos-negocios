"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  ScrollText,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Terrenos", href: "/terrenos", icon: MapPin },
  { label: "Propostas", href: "/propostas", icon: FileText },
  { label: "Contratos", href: "/contratos", icon: ScrollText },
  { label: "Matrículas", href: "/matriculas", icon: BookOpen },
  { label: "Due Diligence", href: "/due-diligence", icon: ShieldCheck },
];

const bottomItems = [
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-black flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-white/10">
        <div className="bg-white rounded-lg px-3 py-2">
          <Image
            src="/brand/logo-web.png"
            alt="INC Empreendimentos"
            width={152}
            height={39}
            className="w-full h-auto"
            priority
          />
        </div>
        <p className="text-white/40 text-[11px] mt-2.5 font-medium tracking-wide uppercase px-1">
          Novos Negócios
        </p>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-[#F26522] text-white"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon
                size={18}
                className={cn(
                  "shrink-0",
                  active ? "text-white" : "text-white/60 group-hover:text-white"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        {bottomItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-[#F26522] text-white"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon size={18} className="shrink-0 text-white/60 group-hover:text-white" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/8 hover:text-white transition-colors"
        >
          <LogOut size={18} className="shrink-0 text-white/60" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
