"use client"

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ArrowUpCircle, 
  ArrowDownCircle,
  FileText,
  Filter,
  ArrowRight,
  TrendingUp as ProfitIcon,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Fragment } from "react";
import { toast } from "sonner";
import { getPayments, getPettyCashMovements, getSubscriptions, getDeals } from "@/lib/actions";

export default function ReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [reportMode, setReportMode] = useState<"consolidated" | "detailed">("detailed");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [payData, movData, subData, dealData] = await Promise.all([
        getPayments(),
        getPettyCashMovements(),
        getSubscriptions(),
        getDeals()
      ]);
      setPayments(payData);
      setMovements(movData);
      setSubscriptions(subData);
      setDeals(dealData);
      setCurrentPage(1);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Haber (Ingresos): Pagos completados + Ingresos de caja chica
  const totalHaber = payments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + Number(p.amount), 0) +
                     movements.filter(m => m.type === 'INCOME').reduce((acc, m) => acc + Number(m.amount), 0);

  // Deber (Egresos): Gastos de caja chica
  const totalDeber = movements.filter(m => m.type === 'EXPENSE').reduce((acc, m) => acc + Number(m.amount), 0);

  const netProfit = totalHaber - totalDeber;

  // Combinar lógicamente para un historial de reportes
  const allActivities = [
    ...payments.filter(p => p.status === 'COMPLETED').map(p => ({
      id: p.id,
      date: p.paymentDate,
      description: `PAGO DE CLIENTE: ${p.customerName || 'GENERAL'} - ${p.serviceName || 'SERVICIO'}`,
      amount: Number(p.amount),
      type: 'HABER',
      category: 'FACTURACIÓN',
      customerDoc: p.customerDoc || ''
    })),
    ...movements.map(m => ({
      id: m.id,
      date: m.date,
      description: m.description,
      amount: Number(m.amount),
      type: m.type === 'INCOME' ? 'HABER' : 'DEBER',
      category: m.category,
      customerDoc: m.linkedCustomerDoc || ''
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aplicar filtros de periodo y búsqueda
  const filteredActivities = allActivities.filter(act => {
    // Filtro de periodo
    const actDate = new Date(act.date);
    const now = new Date();
    let matchesPeriod = true;
    if (period === "today") matchesPeriod = actDate.toDateString() === now.toDateString();
    if (period === "month") matchesPeriod = actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
    if (period === "year") matchesPeriod = actDate.getFullYear() === now.getFullYear();

    // Filtro de búsqueda (ahora incluye customerDoc)
    const matchesSearch = 
    (act.description && act.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (act.category && act.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (act.customerDoc && act.customerDoc.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPeriod && matchesSearch;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, period]);

  // Cálculos para el Reporte Detallado (Estado de Cuenta por Servicio/Contrato)
  const detailedSubscriptions = subscriptions.map(sub => {
    const subPayments = payments.filter(p => p.subscriptionId === sub.id && p.status === 'COMPLETED')
                                .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    const totalPaid = subPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = Number(sub.price) - totalPaid;
    
    return {
      id: sub.id,
      customerName: sub.customerName || 'SIN NOMBRE',
      customerDoc: sub.docNumber || '',
      serviceName: `${sub.serviceName || 'SERVICIO'} ${sub.productName ? `(${sub.productName})` : ''}`,
      totalCost: Number(sub.price),
      totalPaid: totalPaid,
      balance: balance,
      status: sub.status,
      lastPayment: subPayments.length > 0 ? subPayments[0].paymentDate : null,
      paymentsCount: subPayments.length,
      history: subPayments // Guardar historial de pagos
    };
  });

  const detailedDeals = deals.map(deal => {
    const dealPayments = payments.filter(p => p.dealId === deal.id && p.status === 'COMPLETED')
                                 .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    const totalPaid = dealPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = Number(deal.totalAmount) - totalPaid;
    
    return {
      id: deal.id,
      customerName: deal.customerName || 'SIN NOMBRE',
      customerDoc: deal.docNumber || '',
      serviceName: `CONTRATO: ${deal.name}`,
      totalCost: Number(deal.totalAmount),
      totalPaid: totalPaid,
      balance: balance,
      status: deal.status,
      lastPayment: dealPayments.length > 0 ? dealPayments[0].paymentDate : null,
      paymentsCount: dealPayments.length,
      history: dealPayments // Guardar historial de pagos
    };
  });

  const detailedData = [...detailedSubscriptions, ...detailedDeals].filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return item.customerName.toLowerCase().includes(term) ||
           item.customerDoc.toLowerCase().includes(term) ||
           item.serviceName.toLowerCase().includes(term);
  });

  const filteredHaber = filteredActivities.filter(a => a.type === 'HABER').reduce((acc, a) => acc + a.amount, 0);
  const filteredDeber = filteredActivities.filter(a => a.type === 'DEBER').reduce((acc, a) => acc + a.amount, 0);
  const filteredNet = filteredHaber - filteredDeber;

  const handleExport = () => {
    const dataToExport = reportMode === 'consolidated' ? filteredActivities : detailedData;
    if (dataToExport.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          .title { background-color: #000000; color: #ffffff; font-size: 10pt; font-weight: bold; text-align: center; height: 30pt; border: 1px solid #000000; vertical-align: middle; }
          .metadata { font-size: 10pt; color: #000000; text-align: center; border: 1px solid #000000; height: 25pt; vertical-align: middle; }
          .m-label { background-color: #f2f2f2; font-size: 9pt; font-weight: bold; border: 1px solid #000000; text-align: center; padding: 5px; height: 25pt; vertical-align: middle; }
          .m-value { font-size: 9pt; font-weight: bold; border: 1px solid #000000; text-align: right; padding: 5px; height: 25pt; vertical-align: middle; }
          .th { background-color: #f2f2f2; color: #000000; font-weight: bold; font-size: 9pt; border: 1px solid #000000; padding: 5px; text-align: center; vertical-align: middle; height: 25pt; }
          .td { border: 1px solid #000000; font-size: 8pt; padding: 5px; vertical-align: middle; height: 25pt; }
          .haber-text { color: #008800; font-weight: bold; }
          .deber-text { color: #880000; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="5" class="title">ALPHA BUSINESS - ${reportMode === 'consolidated' ? 'REPORTE CONSOLIDADO DE ACTIVIDADES' : 'ESTADO DETALLADO DE AMORTIZACIONES POR SERVICIO'}</td>
          </tr>
          <tr>
            <td colspan="5" class="metadata">FECHA: ${new Date().toLocaleDateString()} | PERIODO: ${period === 'all' ? 'TODOS' : period.toUpperCase()}</td>
          </tr>
          
          <tr height="10"><td colspan="5"></td></tr>
          
          ${reportMode === 'consolidated' ? `
            <tr>
              <td class="m-label" colspan="2">BALANCE NETO</td>
              <td class="m-label">TOTAL HABER</td>
              <td class="m-label" colspan="2">TOTAL DEBER</td>
            </tr>
            <tr>
              <td class="m-value" colspan="2">S/ ${filteredNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td class="m-value"><span class="haber-text">S/ ${filteredHaber.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
              <td class="m-value" colspan="2"><span class="deber-text">S/ ${filteredDeber.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
            </tr>
            
            <tr height="15"><td colspan="5"></td></tr>
            
            <tr>
              <td class="th">FECHA</td>
              <td class="th" style="width: 300pt;">DESCRIPCION / CONCEPTO</td>
              <td class="th">CATEGORIA</td>
              <td class="th">CLASE</td>
              <td class="th">IMPORTE</td>
            </tr>
            ${filteredActivities.map(a => `
              <tr>
                <td class="td" style="text-align: center;" x:str>${new Date(a.date).toLocaleDateString()}</td>
                <td class="td" style="font-weight: bold;">${a.description.toUpperCase()}</td>
                <td class="td">${a.category.toUpperCase()}</td>
                <td class="td" style="text-align: center;">${a.type}</td>
                <td class="td" style="text-align: right; font-weight: bold;">S/ ${a.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          ` : `
            <tr>
              <td class="m-label" colspan="2">DEUDA TOTAL PENDIENTE</td>
              <td class="m-label">TOTAL AMORTIZADO</td>
              <td class="m-label" colspan="2">VALOR CONTRACTUAL</td>
            </tr>
            <tr>
              <td class="m-value" colspan="2"><span class="deber-text">S/ ${detailedData.reduce((acc, d) => acc + d.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
              <td class="m-value"><span class="haber-text">S/ ${detailedData.reduce((acc, d) => acc + d.totalPaid, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
              <td class="m-value" colspan="2">S/ ${detailedData.reduce((acc, d) => acc + d.totalCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
            
            <tr height="15"><td colspan="5"></td></tr>
            
            <tr>
              <td class="th" style="width: 200pt;">CLIENTE / DOC</td>
              <td class="th" style="width: 200pt;">SERVICIO</td>
              <td class="th">COSTO TOTAL</td>
              <td class="th">AMORTIZADO</td>
              <td class="th">SALDO</td>
            </tr>
            ${detailedData.map(d => `
              <tr>
                <td class="td">
                   <font style="font-weight: bold;">${d.customerName.toUpperCase()}</font><br/>
                   <font style="font-size: 7pt; color: #666666;">${d.customerDoc}</font>
                </td>
                <td class="td">${d.serviceName.toUpperCase()}</td>
                <td class="td" style="text-align: right;">S/ ${d.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="td" style="text-align: right; color: #008800;">S/ ${d.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="td" style="text-align: right; font-weight: bold; color: ${d.balance > 0 ? '#880000' : '#008800'};">S/ ${d.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          `}
          
          <tr height="20"><td colspan="5"></td></tr>
          <tr>
            <td colspan="5" style="font-size: 8pt; color: #666666; text-align: center; font-style: italic;">
              REPORTE GENERADO AUTOMATICAMENTE POR ALPHA CRM.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-PE').replace(/\//g, '-');
    const timeFormatted = now.toLocaleTimeString('es-PE', { hour12: false }).replace(/:/g, '-');
    link.setAttribute("download", `reporte_${reportMode === 'detailed' ? 'detallado' : 'consolidado'}_${dateFormatted}_${timeFormatted}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel profesional exportado correctamente.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print:hidden flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-6 border-l-[3px] border-zinc-900 pl-4 py-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium tracking-tight text-zinc-900 uppercase">
              {reportMode === 'consolidated' ? 'Estado de Haber y Deber' : 'Análisis Detallado por Servicio'}
            </h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">
              {reportMode === 'consolidated' ? 'Reportes Financieros • Balance Contable Consolidado' : 'Seguimiento de Costos • Amortizaciones y Balances Pendientes'}
            </p>
          </div>
          
          <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-100">
            <button 
              onClick={() => setReportMode('consolidated')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${reportMode === 'consolidated' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Consolidado
            </button>
            <button 
              onClick={() => { setReportMode('detailed'); setExpandedItems([]); }}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${reportMode === 'detailed' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Detallado
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="BUSCAR CLIENTE, CATEGORÍA O DOCUMENTO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-4 border border-zinc-200 bg-white text-zinc-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-zinc-900 w-full shadow-none transition-all"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-10 border-zinc-100 bg-white text-zinc-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest px-6 shadow-none"
              >
                <Filter size={14} className="mr-2" /> 
                Periodo: {period === 'all' ? 'Ver Todo' : period === 'today' ? 'Hoy' : period === 'month' ? 'Mes' : 'Año'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-2xl border-zinc-100">
              <DropdownMenuItem onClick={() => setPeriod("all")} className="text-[10px] font-bold uppercase py-2.5 rounded-lg">Ver Todo (Consolidado)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("today")} className="text-[10px] font-bold uppercase py-2.5 rounded-lg">Solo Hoy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("month")} className="text-[10px] font-bold uppercase py-2.5 rounded-lg">Este Mes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("year")} className="text-[10px] font-bold uppercase py-2.5 rounded-lg">Este Año</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            onClick={handleExport}
            className="h-10 border-zinc-100 bg-white text-zinc-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest px-6 shadow-none"
          >
            <Download size={14} className="mr-2" /> Exportar Excel
          </Button>

          <Button 
            onClick={handlePrint}
            className="h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest px-6 shadow-none border-none transition-all active:scale-95"
          >
            <FileText size={14} className="mr-2 text-white/70" /> Vista Impresión
          </Button>
        </div>
      </header>

      {/* METRICAS Y TABLAS DINAMICAS */}
      {reportMode === 'consolidated' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-zinc-100 bg-zinc-50 shadow-none rounded-2xl overflow-hidden relative group border">
              <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:rotate-12 transition-transform duration-700 text-zinc-900">
                <TrendingUp size={160} />
              </div>
              <CardContent className="p-4 pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <ProfitIcon size={12} />
                  </div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Balance Neto</p>
                </div>
                <h3 className={`text-2xl font-medium tracking-tighter ${filteredNet >= 0 ? "text-zinc-900" : "text-red-600"}`}>
                  S/ {filteredNet.toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                </h3>
                <div className="mt-2">
                  <Badge variant="outline" className="border-zinc-200 text-zinc-500 text-[7px] px-2 py-0 rounded-full uppercase tracking-wider font-semibold bg-white">
                    Rentabilidad del Periodo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-100 bg-white shadow-none rounded-2xl relative overflow-hidden group border">
              <CardContent className="p-4 pt-6">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Total Haber (Ingresos)</p>
                    <h3 className="text-xl font-semibold text-emerald-600 tracking-tight">S/ {filteredHaber.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                    <ArrowUpCircle size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-100 bg-white shadow-none rounded-2xl relative overflow-hidden group border">
              <CardContent className="p-4 pt-6">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Total Deber (Egresos)</p>
                    <h3 className="text-xl font-semibold text-zinc-900 tracking-tight">S/ {filteredDeber.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 border border-zinc-100">
                    <ArrowDownCircle size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-zinc-100 bg-white shadow-none rounded-3xl border overflow-hidden">
            <CardHeader className="p-7 pb-4 border-b border-zinc-50">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Historial Consolidado</CardTitle>
              <p className="text-[10px] text-zinc-400 font-medium uppercase mt-1">Detalle cronológico de Haber y Deber</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="border-zinc-100">
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest py-4 pl-7 text-zinc-400">Fecha</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Descripción / Concepto</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 text-center">Tipo</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-right pr-7 text-zinc-400">Monto (S/)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Sin actividad registrada en este período</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedActivities.map((act, i) => (
                      <TableRow key={act.id + i} className="border-zinc-50 hover:bg-zinc-50/30 transition-colors uppercase">
                        <TableCell className="py-4 pl-7">
                          <span className="text-[9px] font-semibold text-zinc-500">{new Date(act.date).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-zinc-900 tracking-tight">{act.description}</span>
                            <span className="text-[8px] font-bold text-zinc-300 tracking-widest">{act.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[8px] font-black px-2 py-0.5 rounded-lg border-none ${act.type === 'HABER' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                            {act.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-7">
                          <span className={`text-[10px] font-bold tracking-tighter ${act.type === 'HABER' ? 'text-emerald-700' : 'text-red-700'}`}>
                            S/ {act.amount.toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-zinc-100 bg-amber-50 shadow-none rounded-2xl overflow-hidden relative group border">
              <CardContent className="p-4 pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <AlertCircle size={12} />
                  </div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-amber-700">Deuda por Cobrar</p>
                </div>
                <h3 className="text-2xl font-medium tracking-tighter text-amber-900">
                  S/ {detailedData.reduce((acc, d) => acc + d.balance, 0).toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                </h3>
              </CardContent>
            </Card>

            <Card className="border-zinc-100 bg-white shadow-none rounded-2xl relative overflow-hidden group border">
              <CardContent className="p-4 pt-6">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Amortizaciones Recibidas</p>
                    <h3 className="text-xl font-semibold text-emerald-600 tracking-tight">S/ {detailedData.reduce((acc, d) => acc + d.totalPaid, 0).toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-100 bg-zinc-900 shadow-none rounded-2xl relative overflow-hidden group border">
              <CardContent className="p-4 pt-6">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-300">Total Contratado</p>
                    <h3 className="text-xl font-semibold text-white tracking-tight">S/ {detailedData.reduce((acc, d) => acc + d.totalCost, 0).toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-zinc-800 rounded-lg text-white border border-zinc-700">
                    <FileText size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-zinc-100 bg-white shadow-none rounded-3xl border overflow-hidden">
            <CardHeader className="p-7 pb-4 border-b border-zinc-50">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Análisis Detallado por Servicio</CardTitle>
              <p className="text-[10px] text-zinc-400 font-medium uppercase mt-1">Comparativa de costos, amortizaciones y saldos pendientes</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="border-zinc-100">
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest py-4 pl-7 text-zinc-400">Cliente / Documento</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Servicio Contratado</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 text-right">Costo Total</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 text-right">Amortizado</TableHead>
                    <TableHead className="text-[9px] font-semibold uppercase tracking-widest text-right pr-7 text-zinc-400">Saldo Pendiente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No se encontraron amortizaciones detalladas</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    detailedData.map((item) => {
                      const isExpanded = expandedItems.includes(item.id);
                      return (
                        <Fragment key={item.id}>
                          <TableRow 
                            onClick={() => setExpandedItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                            className="border-zinc-50 hover:bg-zinc-50/50 transition-all uppercase cursor-pointer group"
                          >
                            <TableCell className="py-4 pl-7">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-900 group-hover:text-black transition-colors">{item.customerName}</span>
                                <span className="text-[8px] font-bold text-zinc-300">{item.customerDoc}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[8px] font-bold px-2 py-0 border-zinc-200 text-zinc-500 whitespace-nowrap">
                                {item.serviceName}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-[10px] font-bold text-zinc-500">
                              S/ {item.totalCost.toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right text-[10px] font-bold text-emerald-600">
                              S/ {item.totalPaid.toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right pr-7">
                              <div className="flex items-center justify-end gap-3">
                                <span className={`text-[10px] font-bold ${item.balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
                                  S/ {item.balance.toLocaleString('en-PE', { minimumFractionDigits: 2 })}
                                </span>
                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ArrowRight size={12} className="text-zinc-300" />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-zinc-50/30 hover:bg-zinc-50/50 transition-colors">
                              <TableCell colSpan={5} className="p-0 border-none">
                                <div className="px-7 py-4 animate-in slide-in-from-top-2 duration-300">
                                  <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
                                     <table className="w-full">
                                        <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                           <tr>
                                              <th className="py-2.5 px-4 text-left text-[8px] font-bold uppercase text-zinc-400 tracking-widest">Fecha Amortización</th>
                                              <th className="py-2.5 px-4 text-left text-[8px] font-bold uppercase text-zinc-400 tracking-widest">Detalle del Pago / Método</th>
                                              <th className="py-2.5 px-4 text-right text-[8px] font-bold uppercase text-zinc-400 tracking-widest">Importe</th>
                                           </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                           {item.history && item.history.length > 0 ? item.history.map((h: any, hi: number) => (
                                              <tr key={hi} className="hover:bg-zinc-50/30 transition-colors">
                                                 <td className="py-3 px-4 text-[9px] font-bold text-zinc-500">{new Date(h.paymentDate).toLocaleDateString()}</td>
                                                 <td className="py-3 px-4 flex flex-col gap-0.5">
                                                    <span className="text-[9px] font-bold text-zinc-900 uppercase">Abono #{item.history.length - hi} - {h.method}</span>
                                                    <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-tight">{h.operationNumber ? `OP: ${h.operationNumber}` : 'SIN NRO OP.'} {h.targetAccount ? `• ${h.targetAccount}` : ''}</span>
                                                 </td>
                                                 <td className="py-3 px-4 text-right text-[10px] font-bold text-emerald-600">S/ {h.amount.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</td>
                                              </tr>
                                           )) : (
                                              <tr>
                                                 <td colSpan={3} className="py-4 text-center text-[9px] font-bold text-zinc-300 uppercase italic">Sin amortizaciones registradas</td>
                                              </tr>
                                           )}
                                        </tbody>
                                     </table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
      
    {/* REPORTE FORMAL PARA IMPRESIÓN (OCULTO EN WEB) */}
      <div id="printable-report" className="hidden print:block font-sans text-zinc-900">
         {/* HEADER PREMIUM */}
         <div className="flex justify-between items-center border-b-[0.5px] border-zinc-200 pb-10 mb-10">
            <div>
               <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Alpha Business</h1>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 italic">Intelligence Systems</p>
            </div>
            <div className="flex gap-12 text-right">
               <div>
                  <p className="text-[8px] font-bold uppercase text-zinc-300 tracking-widest mb-1">Tipo de Documento</p>
                  <p className="text-[11px] font-bold uppercase tracking-tight">
                    {reportMode === 'consolidated' ? 'Reporte Consolidado' : 'Estado de Amortizaciones'}
                  </p>
               </div>
               <div>
                  <p className="text-[8px] font-bold uppercase text-zinc-300 tracking-widest mb-1">Fecha de Emisión</p>
                  <p className="text-[11px] font-bold uppercase tracking-tight">{new Date().toLocaleDateString()}</p>
               </div>
            </div>
         </div>

         {/* TITULO DE REPORTE */}
         <div className="mb-6">
            <h2 className="text-lg font-light tracking-tight text-zinc-800 uppercase">
              {reportMode === 'consolidated' ? 'Estado de ' : 'Análisis '}
              <span className="font-bold">{reportMode === 'consolidated' ? 'Haber y Deber' : 'Detallado por Servicio'}</span>
            </h2>
            <div className="h-0.5 w-12 bg-zinc-900 mt-2"></div>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-3">
              {reportMode === 'consolidated' 
                ? `Resumen ejecutivo del período: ${period === 'all' ? 'Toda la actividad' : period.toUpperCase()}`
                : `Estado de cuenta y balances pendientes de cobro`}
            </p>
         </div>

         {/* RESUMEN ANALÍTICO DINAMICO */}
         <div className="grid grid-cols-3 gap-6 mb-10">
            {reportMode === 'consolidated' ? (
              <>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Ingresos Totales (Haber)</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-900">S/</span>
                      <span className="text-xl font-bold tracking-tighter text-zinc-900">
                         {filteredHaber.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Egresos Totales (Deber)</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-400">S/</span>
                      <span className="text-xl font-bold tracking-tighter text-zinc-900">
                         {filteredDeber.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Balance Neto Proyectado</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-400">S/</span>
                      <span className="text-xl font-bold tracking-tighter">
                         {filteredNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Saldo Pendiente (Deuda)</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-900">S/</span>
                      <span className="text-xl font-bold tracking-tighter text-zinc-900">
                         {detailedData.reduce((acc, d) => acc + d.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Total Amortizado (Cobrado)</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-900">S/</span>
                      <span className="text-xl font-bold tracking-tighter text-zinc-900">
                         {detailedData.reduce((acc, d) => acc + d.totalPaid, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl text-zinc-900">
                   <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Valor Total Contratado</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-zinc-400">S/</span>
                      <span className="text-xl font-bold tracking-tighter">
                         {detailedData.reduce((acc, d) => acc + d.totalCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                </div>
              </>
            )}
         </div>

         {/* TABLA DE DETALLE PREMIUM DINAMICA */}
         <div className="mb-12">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 text-zinc-900">
              {reportMode === 'consolidated' ? 'Historial Detallado de Operaciones' : 'Desglose de Amortizaciones por Cliente'}
            </h3>
            <table className="w-full">
               <thead>
                  <tr className="border-b-[1.5px] border-zinc-900">
                     {reportMode === 'consolidated' ? (
                       <>
                         <th className="py-2 px-1 text-left text-[8px] font-black uppercase text-zinc-900 tracking-widest">Fecha</th>
                         <th className="py-2 px-1 text-left text-[8px] font-black uppercase text-zinc-900 tracking-widest">Descripción del Concepto</th>
                         <th className="py-2 px-1 text-left text-[8px] font-black uppercase text-zinc-900 tracking-widest">Categoría</th>
                         <th className="py-2 px-1 text-center text-[8px] font-black uppercase text-zinc-900 tracking-widest">Tipo</th>
                         <th className="py-2 px-1 text-right text-[8px] font-black uppercase text-zinc-900 tracking-widest">Importe</th>
                       </>
                     ) : (
                       <>
                         <th className="py-2 px-1 text-left text-[8px] font-black uppercase text-zinc-900 tracking-widest">Cliente / Servicio</th>
                         <th className="py-2 px-1 text-right text-[8px] font-black uppercase text-zinc-900 tracking-widest">Costo Total</th>
                         <th className="py-2 px-1 text-right text-[8px] font-black uppercase text-zinc-900 tracking-widest">Total Abonado</th>
                         <th className="py-2 px-1 text-right text-[8px] font-black uppercase text-zinc-900 tracking-widest">Saldo Deudor</th>
                       </>
                     )}
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                  {reportMode === 'consolidated' ? (
                    filteredActivities.map((act, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                         <td className="py-3 px-1 text-[9px] font-bold text-zinc-400 whitespace-nowrap">{new Date(act.date).toLocaleDateString()}</td>
                         <td className="py-3 px-1 text-[10px] font-bold text-zinc-900 uppercase tracking-tight">{act.description}</td>
                         <td className="py-3 px-1 text-[8px] font-bold text-zinc-300 uppercase">{act.category}</td>
                         <td className="py-3 px-1 text-center">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${act.type === 'HABER' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-100 text-zinc-400'}`}>
                               {act.type}
                            </span>
                         </td>
                         <td className="py-3 px-1 text-[10px] font-bold text-right text-zinc-900">
                            S/ {act.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </td>
                      </tr>
                    ))
                  ) : (
                    detailedData.map((d, i) => (
                      <Fragment key={i}>
                        <tr className="bg-zinc-50/50">
                           <td className="py-3 px-1 text-[9px] font-bold text-zinc-900 uppercase">
                              <div className="flex flex-col">
                                <span>{d.customerName}</span>
                                <span className="text-[7px] text-zinc-500 font-medium">{d.serviceName}</span>
                              </div>
                           </td>
                           <td className="py-3 px-1 text-[9px] font-bold text-right text-zinc-500">S/ {d.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                           <td className="py-3 px-1 text-[9px] font-bold text-right text-zinc-900">S/ {d.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                           <td className={`py-3 px-1 text-[10px] font-black text-right text-zinc-900`}>
                              S/ {d.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                           </td>
                        </tr>
                        {/* SUB-TABLA DE ABONOS DETALLADOS (TABULAR ESTRUCTURADA) */}
                        {d.history && d.history.length > 0 && (
                          <tr>
                            <td colSpan={4} className="py-2 px-1">
                               <div className="pl-0 my-1 pb-4">
                                  <table className="w-full border-separate border-spacing-0 border border-zinc-300 rounded-md overflow-hidden bg-zinc-50/20">
                                     <thead>
                                        <tr className="bg-zinc-100/50">
                                           <th className="py-1.5 px-3 text-left text-[6px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-300">Fecha</th>
                                           <th className="py-1.5 px-3 text-left text-[6px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-300">Descripción / Detalles del Abono</th>
                                           <th className="py-1.5 px-3 text-right text-[6px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-300">Importe Parcial</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {d.history.map((h: any, hi: number) => (
                                          <tr key={hi} className="last:border-none">
                                             <td className="py-2 px-3 text-[7px] font-bold text-zinc-500 uppercase border-b border-zinc-100">{new Date(h.paymentDate).toLocaleDateString()}</td>
                                             <td className="py-2 px-3 text-[7px] font-medium text-zinc-600 uppercase border-b border-zinc-100 bg-white">
                                                Abono #{d.history.length - hi} - {h.method} {h.operationNumber ? `(OP: ${h.operationNumber})` : ''} 
                                                <span className="ml-2 text-zinc-300 text-[6px]">{h.targetAccount ? `• DESTINO: ${h.targetAccount}` : ''}</span>
                                             </td>
                                             <td className="py-2 px-3 text-[8px] font-bold text-right text-zinc-900 border-b border-zinc-100 bg-white">S/ {h.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                          </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                            </td>
                          </tr>
                        )}
                        {(!d.history || d.history.length === 0) && (
                          <tr>
                             <td colSpan={4} className="py-2 pl-8 text-[7px] font-bold text-zinc-300 uppercase italic">Sin amortizaciones registradas</td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         {/* PIE DE PÁGINA */}
         <div className="mt-24 pt-10 border-t border-zinc-100 flex justify-center items-start">
            <div className="text-center">
               <div className="w-64 border-t border-zinc-900 pt-3">
                  <p className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest">Control Interno Administrativo</p>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Alpha Business Tech • {new Date().getFullYear()}</p>
               </div>
            </div>
         </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
           #printable-report { display: none; }
        }
        @media print {
          /* AISLAMIENTO TOTAL: Ocultar todo lo que no sea el reporte */
          body * { visibility: hidden !important; }
          #printable-report, #printable-report * { visibility: visible !important; }
          
          #printable-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2.5cm !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Resetear márgenes de página */
          @page {
            size: auto;
            margin: 0mm;
          }
          
          html, body {
            background: white !important;
            height: auto !important;
            overflow: visible !important;
          }
        }
      ` }} />
    </>
  );
}
