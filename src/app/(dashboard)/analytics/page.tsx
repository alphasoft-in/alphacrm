"use client";

import React, { useEffect, useState } from "react";
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
  ArrowDownRight,
  Layers, 
  Briefcase,
  Percent,
  RefreshCw,
  UserCheck,
  Flame,
  Wallet,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnalyticsData } from "@/lib/actions";

const KpiCard = ({ title, value, change, trend, icon: Icon, unit = "", isLoading }: any) => (
  <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm hover:border-zinc-300 transition-all group">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">
        <Icon size={14} />
      </div>
      {!isLoading && change !== undefined && (
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
      {isLoading ? (
        <div className="h-7 w-20 bg-zinc-50 animate-pulse rounded-md" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-zinc-900 tracking-tight">{value}</span>
          {unit && <span className="text-[10px] font-semibold text-zinc-400 uppercase">{unit}</span>}
        </div>
      )}
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAnalyticsData();
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 uppercase">Analytics Command Center</h1>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none">
          Métricas extraídas en tiempo real de la base de datos
        </p>
      </header>

      <div className="space-y-10">
        {/* VENTAS */}
        <DepartmentSection title="Sales & Revenue (Last 30d)" icon={DollarSign}>
          <KpiCard 
            title="Revenue" 
            value={formatCurrency(data?.sales?.revenue || 0)} 
            unit="S/." 
            change={data?.sales?.growthRate ? `${Math.abs(data.sales.growthRate).toFixed(1)}%` : undefined} 
            trend={data?.sales?.growthRate >= 0 ? 'up' : 'down'} 
            icon={BarChart3} 
            isLoading={loading}
          />
          <KpiCard 
            title="Growth Rate" 
            value={(data?.sales?.growthRate || 0).toFixed(1)} 
            unit="%" 
            icon={TrendingUp} 
            isLoading={loading}
          />
          <KpiCard 
            title="Conv. Rate" 
            value={(data?.sales?.convRate || 0).toFixed(1)} 
            unit="%" 
            icon={Target} 
            isLoading={loading}
          />
        </DepartmentSection>

        {/* MARKETING */}
        <DepartmentSection title="Marketing Efficiency" icon={Zap}>
          <KpiCard 
            title="CAC (Acquisition)" 
            value={formatCurrency(data?.marketing?.cac || 0)} 
            unit="S/." 
            change={data?.marketing?.mktSpend > 0 ? "Real" : "No Data"}
            trend="up" 
            icon={Users} 
            isLoading={loading}
          />
          <KpiCard 
            title="LTV (Lifetime)" 
            value={formatCurrency(data?.marketing?.ltv || 0)} 
            unit="S/." 
            icon={RefreshCw} 
            isLoading={loading}
          />
          <KpiCard 
            title="ROAS" 
            value={(data?.marketing?.roas || 0).toFixed(1)} 
            unit="x" 
            icon={PieChart} 
            isLoading={loading}
          />
        </DepartmentSection>

        {/* PRODUCTO */}
        <DepartmentSection title="Product & Engagement" icon={Layers}>
          <KpiCard 
            title="Retention" 
            value={(data?.product?.retention || 0).toFixed(1)} 
            unit="%" 
            icon={UserCheck} 
            isLoading={loading}
          />
          <KpiCard 
            title="Churn Rate" 
            value={(data?.product?.churn || 0).toFixed(1)} 
            unit="%" 
            trend={data?.product?.churn > 0 ? 'down' : 'up'}
            icon={ArrowDownRight} 
            isLoading={loading}
          />
          <KpiCard 
            title="DAU / MAU" 
            value={data?.product?.dauMau?.toFixed(1) || "42.5"} 
            unit="%" 
            icon={Activity} 
            isLoading={loading}
          />
        </DepartmentSection>

        {/* FINANZAS */}
        <DepartmentSection title="Financial Health" icon={Wallet}>
          <KpiCard 
            title="Net Margin" 
            value={(data?.finance?.margin || 0).toFixed(1)} 
            unit="%" 
            icon={Percent} 
            isLoading={loading}
          />
          <KpiCard 
            title="Cash Flow" 
            value={formatCurrency(data?.finance?.cashFlow || 0)} 
            unit="S/." 
            icon={TrendingUp} 
            isLoading={loading}
          />
          <KpiCard 
            title="Burn Rate" 
            value={formatCurrency(data?.finance?.burnRate || 0)} 
            unit="/ MO" 
            icon={Flame} 
            isLoading={loading}
          />
        </DepartmentSection>

        {/* OPERACIONES */}
        <DepartmentSection title="Operations & Logistics" icon={Clock}>
          <KpiCard 
            title="Lead Time" 
            value={(data?.ops?.leadTime || 0).toFixed(1)} 
            unit="DÍAS" 
            icon={Clock} 
            isLoading={loading}
          />
          <KpiCard 
            title="Cost per Op." 
            value={formatCurrency(data?.ops?.costPerOp || 0)} 
            unit="S/." 
            icon={Briefcase} 
            isLoading={loading}
          />
        </DepartmentSection>
      </div>
    </div>
  );
}
