"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Package, 
  Settings, 
  Calendar,
  ChevronRight,
  Layers,
  Briefcase,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: BarChart3, label: "Panel Principal", href: "/" },
  { icon: Users, label: "Clientes", href: "/customers" },
  { icon: Package, label: "Servicios", href: "/services" },
  { icon: Layers, label: "Suscripciones", href: "/subscriptions" },
  { icon: Briefcase, label: "Contratos", href: "/contracts" },
  { icon: CreditCard, label: "Pagos", href: "/payments" },
  { icon: Calendar, label: "Renovaciones", href: "/renewals" },
  { icon: BarChart3, label: "Reportes", href: "/reports" },
  { icon: Wallet, label: "Caja Chica", href: "/petty-cash" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-zinc-950 shadow-sm transition-all duration-300">
      <div className="flex h-16 items-center px-6 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-black/10">
             A
          </div>
          <span className="text-lg font-bold tracking-tighter text-zinc-900 leading-none uppercase">Alpha Business</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-8 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
                isActive 
                  ? "bg-zinc-900 text-white shadow-md shadow-black/5" 
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-zinc-900")} />
                {item.label}
              </div>
              {isActive && <ChevronRight size={12} className="text-white/50" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
