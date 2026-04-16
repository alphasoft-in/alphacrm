'use client'

import { 
  Search, 
  User as UserIcon, 
  LogOut,
  ChevronDown,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout } from "@/lib/auth-actions";
import Link from "next/link";
import { Notifications } from "./Notifications";

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  // Initials from email if name is null
  const initials = user?.email[0].toUpperCase() || 'A';

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <Input 
            placeholder="Búsqueda global..." 
            className="pl-10 h-10 bg-zinc-50 border-none focus-visible:ring-1 focus-visible:ring-zinc-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Notifications />
        
        <div className="flex items-center gap-2 border-l pl-4 ml-2 h-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none group">
                 <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                   {user?.role || 'USUARIO'}
                 </span>
                 <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                 </div>
                 <ChevronDown size={14} className="text-zinc-300 group-data-[state=open]:rotate-180 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <form action={logout} className="w-full">
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
