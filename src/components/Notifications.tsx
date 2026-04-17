"use client"

import { useState, useEffect } from "react";
import { 
  Bell, 
  Calendar, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getUpcomingRenewals, getGlobalActivity } from "@/lib/actions";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Notifications() {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lastReadNotifications');
    if (saved) setLastRead(parseInt(saved));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [renewalsData, activityData] = await Promise.all([
        getUpcomingRenewals(),
        getGlobalActivity()
      ]);
      setRenewals(renewalsData);
      setActivity(activityData);
      setLoading(false);
    };
    fetchData();
  }, [pathname]);

  const markAllAsRead = () => {
    const now = Date.now();
    localStorage.setItem('lastReadNotifications', now.toString());
    setLastRead(now);
  };

  const handleNotificationClick = (target: string) => {
    markAllAsRead();
    router.push(target);
  };

  const unreadCount = 
    renewals.filter(r => !lastRead || new Date(r.timestamp || r.nextRenewal || 0).getTime() > lastRead).length + 
    activity.filter(a => !lastRead || new Date(a.timestamp || a.date).getTime() > lastRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-zinc-900 transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-zinc-900 text-[8px] text-white font-bold items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[300px] p-0 border-zinc-200 bg-white shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-5 py-4 bg-zinc-50 border-b border-zinc-100 flex flex-col gap-1">
           <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Notificaciones</span>
        </DropdownMenuLabel>
        
        <div className="max-h-[350px] overflow-y-auto">
          {loading ? (
             <div className="p-10 flex items-center justify-center text-[9px] font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">
                Sincronizando Alertas...
             </div>
          ) : (renewals.length === 0 && activity.length === 0) ? (
             <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center">
                   <CheckCircle2 size={16} className="text-zinc-200" />
                </div>
                <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">Sin Pendientes</p>
             </div>
          ) : (
            <div className="py-1">
              {/* TRANSACCIONES RECIENTES */}
              {activity.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-zinc-50/50 text-[8px] font-bold text-zinc-400 uppercase tracking-widest border-y border-zinc-100">
                    Transacciones Recientes
                  </div>
                  {activity.map((act) => (
                    <DropdownMenuItem 
                      key={act.id} 
                      className="px-5 py-3 cursor-pointer hover:bg-zinc-50 transition-colors border-none group"
                      onClick={() => {
                        let target = '/reports';
                        if (act.type === 'INCOME' || act.type === 'EXPENSE') target = '/petty-cash';
                        if (act.type === 'NEW_DEAL') target = '/contracts';
                        if (act.type === 'NEW_SUBSCRIPTION') target = '/subscriptions';
                        handleNotificationClick(target);
                      }}
                    >
                       <div className="flex gap-4 items-start w-full">
                          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${act.type === 'INCOME' || act.type === 'PAYMENT' || act.type === 'NEW_DEAL' || act.type === 'NEW_SUBSCRIPTION' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div className="flex flex-col flex-1 gap-1">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-900 uppercase leading-none truncate max-w-[140px] tracking-tight">
                                   {act.customerName}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-900 tracking-tighter">
                                   {act.type === 'EXPENSE' ? '-' : '+'} S/ {parseFloat(act.amount).toFixed(2)}
                                </span>
                             </div>
                             <span className="text-[8px] text-zinc-400 font-semibold uppercase tracking-tight leading-none truncate max-w-[180px]">
                                {act.serviceName}
                             </span>
                          </div>
                       </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {/* RENOVACIONES */}
              {renewals.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-zinc-50/50 text-[8px] font-bold text-zinc-400 uppercase tracking-widest border-y border-zinc-100">
                    Alertas de Renovación
                  </div>
                  {renewals.map((renewal) => {
                    const daysLeft = renewal.nextRenewal ? (Math.ceil((new Date(renewal.nextRenewal).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : -1;
                    const isOverdue = daysLeft <= 0;
                    const isUndefined = !renewal.nextRenewal;
                    
                    return (
                      <DropdownMenuItem 
                        key={renewal.id} 
                        className="px-5 py-3.5 cursor-pointer hover:bg-zinc-50 border-none transition-colors group"
                        onClick={() => handleNotificationClick('/renewals')}
                      >
                        <div className="flex gap-4 items-start w-full">
                          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${isUndefined ? 'bg-orange-500 animate-pulse' : isOverdue ? 'bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.3)]' : daysLeft <= 7 ? 'bg-zinc-600' : 'bg-zinc-200'}`} />
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-zinc-900 uppercase leading-none truncate max-w-[140px] tracking-tight">
                                {renewal.customerName}
                              </span>
                              <span className={`text-[8px] font-bold uppercase tracking-widest ${isUndefined ? 'text-orange-600' : isOverdue ? 'text-zinc-950 underline decoration-zinc-300' : 'text-zinc-400'}`}>
                                {isUndefined ? 'PENDIENTE' : isOverdue ? 'Vencido' : `${daysLeft}d`}
                              </span>
                            </div>
                            <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-tight leading-none">
                              {renewal.serviceName}
                            </span>
                          </div>
                          <ChevronRight size={12} className="text-zinc-200 mt-2 group-hover:text-zinc-900 transition-colors" />
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-zinc-50" />
        <DropdownMenuItem asChild>
            <button 
              onClick={() => handleNotificationClick('/reports')}
              className="w-full px-5 py-3 hover:bg-zinc-50 transition-colors flex items-center justify-center outline-none cursor-pointer border-none bg-transparent"
            >
              <span className="text-[8px] font-bold text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                 Ver todas las actividades
                 <ArrowUpRight size={10} />
              </span>
            </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ArrowUpRight({ size }: { size: number }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
   )
}
