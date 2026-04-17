"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface DashboardChartsProps {
  data: any[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700 delay-200">
      {/* Principal: Balance Operativo */}
      <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Balance Operativo</h3>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Últimos 6 meses • Ingresos vs Egresos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-900" />
              <span className="text-[8px] font-bold uppercase text-zinc-500">Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-200" />
              <span className="text-[8px] font-bold uppercase text-zinc-500">Egresos</span>
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
              />
              <Tooltip 
                cursor={{ fill: "#f8f8f8" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-2xl flex flex-col gap-2">
                        <p className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-50 pb-1 mb-1">{payload[0].payload.month}</p>
                        {payload.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-8">
                            <span className="text-[9px] font-bold uppercase text-zinc-500">{p.name}</span>
                            <span className="text-[10px] font-black text-zinc-900">S/ {p.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="ingresos" 
                name="Ingresos" 
                fill="#18181b" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
              <Bar 
                dataKey="egresos" 
                name="Egresos" 
                fill="#e4e4e7" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secundario: Tendencia de Crecimiento */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col gap-6 relative">
         <div className="flex flex-col gap-1 relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Proyección de Flujo</h3>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Tendencia Histórica</p>
         </div>

         <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                          return (
                             <div className="bg-zinc-900 p-2 px-3 rounded-lg shadow-xl">
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">S/ {payload[0].value.toLocaleString()}</span>
                             </div>
                          );
                       }
                       return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#18181b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorIngresos)" 
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="mt-auto border-t border-zinc-50 pt-4 flex items-center justify-between relative z-10">
            <div className="flex flex-col">
               <span className="text-[8px] font-bold text-zinc-300 uppercase">Volumen Máximo</span>
               <span className="text-xs font-bold text-zinc-900 tracking-tight">
                  S/ {Math.max(...data.map(d => d.ingresos)).toLocaleString()}
               </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
         </div>
      </div>
    </div>
  );
}
