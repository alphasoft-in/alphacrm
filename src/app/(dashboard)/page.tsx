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
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function Dashboard() {
  const data = await getDashboardStats();
  
  if (!data) return null;

  const stats = [
    { title: "Recaudación Realizada", value: `S/ ${data.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) || "0.00"}`, desc: "FLUJO TOTAL" },
    { title: "Entidades Activas", value: data.totalCustomers.toString() || "0", desc: "CLIENTES" },
    { title: "Vínculos Activos", value: data.activeSubscriptions.toString() || "0", desc: "CONTRATOS + SUBS" },
    { title: "Gestión Integrada", value: data.totalServices.toString() || "0", desc: "SERVICIOS TOT." },
  ];

  const recentActivity = data.recentActivity || [];

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-500">
      {/* Structural Header */}
      <header className="flex flex-col gap-1 border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Dashboard</h1>
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
        <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-64 h-64 text-zinc-950" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-900">Monitor de Rendimiento</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 relative z-10 mt-6">
             <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight uppercase leading-none">Pulso Operativo</h2>
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-widest leading-relaxed max-w-[240px]">
                  Análisis consolidado de flujos de caja, amortizaciones y retención proyectada para el ciclo actual.
                </p>
                <div className="mt-4 flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-zinc-300 uppercase">Crecimiento (Mes)</span>
                      <span className="text-lg font-bold text-zinc-900">+12.4%</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-zinc-300 uppercase">Tasa de Amortización</span>
                      <span className="text-lg font-bold text-zinc-900">84.2%</span>
                   </div>
                </div>
             </div>

             <div className="bg-zinc-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl shadow-zinc-200">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Saldo Pendiente (Deals)</span>
                   <span className="text-2xl font-bold tracking-tighter">S/ {data.totalPending.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Estado de Cobranza</span>
                   <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-white" />
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-6">
             <div className="flex-1 h-0.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-zinc-950 animate-progress" />
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
             <Link href="/reports">
                <ArrowUpRight size={14} className="text-zinc-400 hover:text-zinc-900 transition-colors" />
             </Link>
          </div>
          
          <div className="flex-1 overflow-auto divide-y divide-zinc-50">
             {recentActivity.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                   <p className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest">Esperando Transacciones</p>
                </div>
             ) : recentActivity.slice(0, 7).map((act: any, i: number) => (
                <div key={i} className="p-4 py-3 hover:bg-zinc-50/50 transition-colors flex items-center justify-between group">
                   <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                      <span className="text-[10px] font-semibold text-zinc-900 truncate uppercase tracking-tight">{act.customerName}</span>
                      <span className="text-[8px] font-medium text-zinc-400 truncate uppercase tracking-widest">{act.serviceName}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase">{new Date(act.date).toLocaleDateString('es-PE')}</span>
                   </div>
                </div>
             ))}
          </div>
          <Link href="/reports" className="p-4 text-center bg-zinc-50/80 hover:bg-zinc-100 border-t border-zinc-100 transition-all group">
             <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-900">Ver Auditoría Completa</span>
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts data={data.chartData} />
    </div>
  )
}
