"use client"

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Search, 
  MoreHorizontal, 
  Clock,
  User,
  ShieldAlert,
  Layers,
  TrendingDown,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { getUpcomingRenewals, renewSubscription } from "@/lib/actions";
import { toast } from "sonner";

export default function RenewalsPage() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUpcomingRenewals();
      setRenewals(data);
    } catch (e) {
      toast.error("Error al cargar renovaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenew = async (id: string) => {
    setIsRenewing(id);
    try {
      const result = await renewSubscription(id);
      if (result.success) {
        toast.success("Renovación procesada con éxito.");
        fetchData();
      } else {
        toast.error("Error al procesar renovación.");
      }
    } catch (e) {
      toast.error("Error de conexión.");
    } finally {
      setIsRenewing(null);
    }
  };

  const calculateUrgency = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (diff < 0) return "VENCIDO";
    if (diff < 7) return "CRÍTICA";
    if (diff < 15) return "MEDIA";
    return "BAJA";
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'VENCIDO': return 'bg-red-500 text-white border-red-500 hover:bg-red-600';
      case 'CRÍTICA': return 'bg-zinc-900 text-white border-zinc-900 hover:bg-black';
      case 'MEDIA': return 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200';
      default: return 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:bg-zinc-100';
    }
  };

  const filteredRenewals = renewals.filter(r => 
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.serviceName.toLowerCase().includes(search.toLowerCase())
  );

  const totalProjected = renewals.reduce((acc, r) => acc + (r.price || 0), 0);
  const expiredCount = renewals.filter(r => new Date(r.nextRenewal) < new Date()).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Renovaciones</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Garantía de Continuidad • Ciclo de Retención</p>
        </div>
        
        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              <Calendar size={16} className="mr-2" />
              Calendario Proyectado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] p-0 border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <DialogHeader className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center gap-5 space-y-0 text-left">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-black/10">
                <BarChart3 size={24} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-semibold tracking-tight uppercase text-zinc-900 leading-none">
                  Previsión de Ingresos
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[10px] mt-2 font-semibold uppercase tracking-widest leading-none">
                  Proyección financiera basada en ciclos de renovación
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="p-8 bg-white grid gap-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                     <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Total proyectado (Próximos 30d)</p>
                     <p className="text-xl font-bold text-zinc-900 mt-1">S/ {totalProjected.toLocaleString()}</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                     <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Tasa de Retención Obj.</p>
                     <p className="text-xl font-bold text-emerald-600 mt-1">98.5%</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Servicios por Titular</p>
                  <div className="grid gap-3">
                     {renewals.slice(0, 5).map((r, idx) => (
                        <div key={idx} className="flex items-center group">
                           <div className="w-40 text-[10px] font-bold text-zinc-500 uppercase truncate pr-4">{r.customerName}</div>
                           <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden relative border border-zinc-200/50">
                              <div 
                                 className="h-full bg-zinc-900 group-hover:bg-emerald-500 transition-all duration-700"
                                 style={{ width: `${Math.min((r.price / 1000) * 100, 100)}%` }}
                              />
                           </div>
                           <div className="w-32 text-right">
                              <span className="text-[11px] font-bold text-zinc-900">S/ {(r.price || 0).toLocaleString()}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <DialogFooter className="px-8 py-6 bg-zinc-50 border-t border-zinc-100">
               <Button variant="outline" onClick={() => setCalendarOpen(false)} className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest rounded-xl bg-white border-zinc-200">
                  Cerrar Previsión
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm transition-all hover:border-zinc-300">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Renovaciones Próximas</span>
               <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-zinc-900 tracking-tight">{renewals.length} Servicios</span>
                  <div className="p-1.5 bg-zinc-900 rounded-lg shadow-sm">
                    <Clock size={12} className="text-white" />
                  </div>
               </div>
               <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1 leading-none">S/ {totalProjected.toLocaleString()} Proyectado</p>
            </div>
         </div>
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm transition-all hover:border-zinc-300">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Alerta de Vencimiento</span>
               <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-zinc-900 tracking-tight">{expiredCount} Vencido{expiredCount !== 1 && 's'}</span>
                  <div className="p-1.5 bg-red-50 rounded-lg border border-red-100">
                    <ShieldAlert size={12} className="text-red-500" />
                  </div>
               </div>
               <p className={`text-[9px] font-bold uppercase mt-1 leading-none ${expiredCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                 {expiredCount > 0 ? 'Atención Inmediata' : 'Sin Vencimientos'}
               </p>
            </div>
         </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-zinc-100">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <Input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrado por titular, servicio o periodo..." 
                className="pl-9 h-10 border-none bg-zinc-50/50 text-xs font-semibold uppercase"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Titular / Proyecto</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Servicio</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Término</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Inversión</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Prioridad</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="text-zinc-900 animate-spin" />
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Analizando ciclo de renovaciones...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRenewals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">No se encontraron servicios por renovar</p>
                  </TableCell>
                </TableRow>
              ) : filteredRenewals.map((item) => {
                const urgency = calculateUrgency(item.nextRenewal);
                return (
                  <TableRow key={item.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors uppercase">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-bold text-zinc-900 tracking-tight">{item.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-semibold text-zinc-600 tracking-tight">{item.serviceName}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                         <Calendar size={12} className={`${new Date(item.nextRenewal) < new Date() ? 'text-red-500' : 'text-zinc-300'}`} />
                         <span className={`text-[10px] font-bold ${new Date(item.nextRenewal) < new Date() ? 'text-red-600' : 'text-zinc-900'}`}>
                           {new Date(item.nextRenewal).toLocaleDateString()}
                         </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[11px] font-bold text-zinc-900">S/ {(item.price || 0).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[8px] font-bold px-2.5 py-0.5 rounded-lg shadow-none border-zinc-200",
                        getUrgencyColor(urgency)
                      )}>
                        {urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border-none ring-0 focus-visible:ring-0"><MoreHorizontal size={14} /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl border-zinc-200 bg-white">
                            <DropdownMenuLabel className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest px-3 py-2 mt-0.5 leading-none">Continuidad</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                            <DropdownMenuItem 
                              disabled={isRenewing === item.id}
                              onClick={() => handleRenew(item.id)}
                              className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-zinc-900"
                            >
                               {isRenewing === item.id ? (
                                 <Loader2 size={14} className="animate-spin text-zinc-400" />
                               ) : (
                                 <RotateCcw size={14} className="text-zinc-400" /> 
                               )}
                               <span className="flex-1">Procesar Renovación</span>
                               <ArrowUpRight size={12} className="text-zinc-300" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-zinc-600">
                               <AlertTriangle size={14} className="text-zinc-400" /> Emitir Alerta
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </ Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
