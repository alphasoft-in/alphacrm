import { 
  Users, 
  Layers, 
  Package, 
  DollarSign, 
  ArrowUpRight,
  Activity,
  History
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions";
import Link from "next/link";

export default async function Dashboard() {
  const data = await getDashboardStats();
  
  const stats = [
    { title: "Recaudación Confirmada", value: `S/ ${data?.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) || "0.00"}`, desc: "" },
    { title: "Entidades Activas", value: data?.totalCustomers.toString() || "0", desc: "" },
    { title: "Vínculos Recurrentes", value: data?.activeSubscriptions.toString() || "0", desc: "" },
    { title: "Servicios Disponibles", value: data?.totalServices.toString() || "0", desc: "" },
  ];

  const recentSubs = data?.recentSubscriptions || [];

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-500">
      {/* Structural Header */}
      <header className="flex flex-col gap-1 border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Sala de Control Alpha</h1>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none">Centro de Inteligencia • Sincronización en Tiempo Real</p>
      </header>

      {/* Modern Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-5 pt-4 rounded-xl shadow-sm hover:border-zinc-300 transition-all cursor-default">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{stat.title}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-zinc-900 tracking-tighter">{stat.value}</span>
                <span className="text-[9px] font-medium text-zinc-300 uppercase italic">{stat.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[350px]">
        {/* Core Monitor */}
        <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-64 h-64 text-zinc-950" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-900">Monitor de Rendimiento</span>
            </div>
          </div>

          <div className="relative z-10 mt-10">
            <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight uppercase leading-none mb-3">Proceso de Analítica</h2>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest leading-relaxed max-w-sm">
              Analizando dinámicas de flujo de caja y métricas de retención de clientes. estado: <span className="text-zinc-900 font-semibold">Procesando flujos en segundo plano.</span>
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex-1 h-0.5 bg-zinc-100 rounded-full overflow-hidden">
               <div className="h-full w-1/3 bg-zinc-950" />
            </div>
          </div>
        </div>

        {/* Real-Time activity */}
        <div className="bg-white border border-zinc-200 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-zinc-50">
             <div className="flex items-center gap-2">
                <History size={14} className="text-zinc-400" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-900">Actividad Reciente</span>
             </div>
             <Link href="/subscriptions">
                <ArrowUpRight size={14} className="text-zinc-400 hover:text-zinc-900 transition-colors" />
             </Link>
          </div>
          
          <div className="flex-1 overflow-auto divide-y divide-zinc-50">
             {recentSubs.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                   <p className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest">Esperando Transacciones</p>
                </div>
             ) : recentSubs.slice(0, 7).map((sub: any, i: number) => (
                <div key={i} className="p-4 py-3 hover:bg-zinc-50/50 transition-colors flex items-center justify-between group">
                   <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                      <span className="text-[10px] font-semibold text-zinc-900 truncate uppercase tracking-tight">{sub.customerName}</span>
                      <span className="text-[8px] font-medium text-zinc-400 truncate uppercase tracking-widest">{sub.serviceName}</span>
                   </div>
                   <div className="h-1.5 w-1.5 rounded-full bg-zinc-100 group-hover:bg-zinc-900 transition-colors" />
                </div>
             ))}
          </div>
          <Link href="/subscriptions" className="p-4 text-center bg-zinc-50/80 hover:bg-zinc-100 border-t border-zinc-100 transition-all group">
             <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-900">Ver Auditoría Completa</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
