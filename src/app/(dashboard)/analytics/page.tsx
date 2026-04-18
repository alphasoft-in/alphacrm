"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Zap, 
  Clock, 
  Activity, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  Layers, 
  Briefcase,
  Percent,
  RefreshCw,
  UserCheck,
  Flame,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KpiCard = ({ title, value, change, trend, icon: Icon, unit = "" }: any) => (
  <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm hover:border-zinc-300 transition-all group">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">
        <Icon size={14} />
      </div>
      {change && (
        <div className={cn(
          "flex items-center gap-1 text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-md",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-zinc-900 tracking-tight">{value}</span>
        {unit && <span className="text-[10px] font-semibold text-zinc-400 uppercase">{unit}</span>}
      </div>
    </div>
  </div>
);

const DepartmentSection = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 border-l-2 border-zinc-900 pl-3 py-1">
      <Icon size={14} className="text-zinc-400" />
      <h2 className="text-[11px] font-bold text-zinc-900 uppercase tracking-[0.2em]">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 uppercase">Analytics Command Center</h1>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none">
          Métricas de alto rendimiento • Visión Transversal 360°
        </p>
      </header>

      <div className="space-y-10">
        {/* VENTAS */}
        <DepartmentSection title="Sales & Revenue" icon={DollarSign}>
          <KpiCard 
            title="Total Revenue" 
            value="142.5K" 
            unit="USD" 
            change="+12.5%" 
            trend="up" 
            icon={BarChart3} 
          />
          <KpiCard 
            title="Growth Rate" 
            value="24.8" 
            unit="%" 
            change="+4.2%" 
            trend="up" 
            icon={TrendingUp} 
          />
          <KpiCard 
            title="Conv. Rate" 
            value="3.2" 
            unit="%" 
            change="-0.5%" 
            trend="down" 
            icon={Target} 
          />
        </DepartmentSection>

        {/* MARKETING */}
        <DepartmentSection title="Marketing Efficiency" icon={Zap}>
          <KpiCard 
            title="CAC (Acquisition)" 
            value="45.20" 
            unit="USD" 
            change="-8.4%" 
            trend="up" // Reducir costo es bueno, pero usemos 'up' para mejora
            icon={Users} 
          />
          <KpiCard 
            title="LTV (Lifetime)" 
            value="1,240" 
            unit="USD" 
            change="+15.2%" 
            trend="up" 
            icon={RefreshCw} 
          />
          <KpiCard 
            title="ROAS" 
            value="4.8" 
            unit="x" 
            change="+0.6" 
            trend="up" 
            icon={PieChart} 
          />
        </DepartmentSection>

        {/* PRODUCTO */}
        <DepartmentSection title="Product & Engagement" icon={Layers}>
          <KpiCard 
            title="Retention" 
            value="88.4" 
            unit="%" 
            change="+2.1%" 
            trend="up" 
            icon={UserCheck} 
          />
          <KpiCard 
            title="Churn Rate" 
            value="2.4" 
            unit="%" 
            change="-0.8%" 
            trend="up" 
            icon={ArrowDownRight} 
          />
          <KpiCard 
            title="DAU / MAU" 
            value="42.5" 
            unit="%" 
            change="+5.4%" 
            trend="up" 
            icon={Activity} 
          />
        </DepartmentSection>

        {/* FINANZAS */}
        <DepartmentSection title="Financial Health" icon={Wallet}>
          <KpiCard 
            title="Net Margin" 
            value="32.5" 
            unit="%" 
            change="+1.4%" 
            trend="up" 
            icon={Percent} 
          />
          <KpiCard 
            title="Cash Flow" 
            value="28.4K" 
            unit="USD" 
            change="+12.4K" 
            trend="up" 
            icon={TrendingUp} 
          />
          <KpiCard 
            title="Burn Rate" 
            value="12.5K" 
            unit="/ MO" 
            change="-2.1K" 
            trend="up" 
            icon={Flame} 
          />
        </DepartmentSection>

        {/* OPERACIONES */}
        <DepartmentSection title="Operations & Logistics" icon={Clock}>
          <KpiCard 
            title="Lead Time" 
            value="4.2" 
            unit="DÍAS" 
            change="-0.5" 
            trend="up" 
            icon={Clock} 
          />
          <KpiCard 
            title="Cost per Op." 
            value="12.40" 
            unit="USD" 
            change="-1.20" 
            trend="up" 
            icon={Briefcase} 
          />
        </DepartmentSection>
      </div>
    </div>
  );
}
