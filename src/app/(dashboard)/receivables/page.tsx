"use client"

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  Search, 
  Calendar, 
  Users, 
  DollarSign, 
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { getAccountsReceivable } from "@/lib/actions";

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getAccountsReceivable();
    setReceivables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReceivables = receivables.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceivable = receivables.reduce((acc, r) => acc + parseFloat(r.balance), 0);
  const overdueCount = receivables.filter(r => new Date(r.date) < new Date()).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-6 border-l-[3px] border-zinc-900 pl-4 py-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium tracking-tight text-zinc-900 uppercase">Cuentas por Cobrar</h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Cartera de Clientes y Deuda Pendiente</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="BUSCAR CLIENTE O SERVICIO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-4 border border-zinc-200 bg-white text-zinc-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-zinc-900 w-full shadow-none transition-all"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-100 bg-zinc-900 shadow-none rounded-2xl border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-zinc-800 rounded-lg text-white">
                  <TrendingUp size={16} />
               </div>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total por Cobrar</span>
            </div>
            <h3 className="text-3xl font-medium tracking-tighter text-white">S/ {totalReceivable.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 bg-white shadow-none rounded-2xl border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                  <AlertTriangle size={16} />
               </div>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Registros Morosos</span>
            </div>
            <h3 className="text-3xl font-medium tracking-tighter text-rose-600">{overdueCount} <span className="text-xs uppercase font-bold text-zinc-400 tracking-widest">Clientes</span></h3>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 bg-zinc-50 shadow-none rounded-2xl border">
          <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
             <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Eficiencia de Cobro</p>
             <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    className="text-zinc-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="28"
                    cx="32"
                    cy="32"
                  />
                  <circle
                    className="text-zinc-900 transition-all duration-1000 ease-out"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - (receivables.length > 0 ? 0.85 : 0) / 1)} 
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="28"
                    cx="32"
                    cy="32"
                  />
                </svg>
                <span className="absolute text-[12px] font-black text-zinc-900">
                  {receivables.length > 0 ? '85%' : '0%'}
                </span>
             </div>
             <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter mt-2">Salud de Cartera: Óptima</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-100 shadow-none rounded-2xl overflow-hidden border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 pl-8 text-zinc-400">Cliente / Servicio</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center text-zinc-400">Origen</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center text-zinc-400">Fecha / Venc.</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right pr-8 text-zinc-400">Deuda Pendiente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-[10px] font-bold text-zinc-300 uppercase animate-pulse">Analizando cartera...</TableCell></TableRow>
              ) : filteredReceivables.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-[10px] font-bold text-zinc-300 uppercase">Sin deudas pendientes registradas</TableCell></TableRow>
              ) : filteredReceivables.map((r) => {
                const isOverdue = new Date(r.date) < new Date();
                return (
                  <TableRow key={r.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors group">
                    <TableCell className="py-5 pl-8">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{r.customerName}</span>
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <FileText size={10} /> {r.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${r.source === 'DEAL' ? 'bg-zinc-100 text-zinc-700' : 'bg-blue-50 text-blue-700'}`}>
                        {r.source === 'DEAL' ? 'CONTRATO' : 'SUSCRIPCIÓN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-zinc-500'}`}>{new Date(r.date).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-[7px] font-black bg-rose-600 text-white px-1.5 rounded-full uppercase tracking-tighter">MORA</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-zinc-950 tracking-tighter">S/ {parseFloat(r.balance).toFixed(2)}</span>
                        <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Saldo de Cobro</span>
                       </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
