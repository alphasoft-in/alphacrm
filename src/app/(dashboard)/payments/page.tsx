"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar,
  CreditCard,
  Trash2,
  Eye,
  Loader2,
  Wallet,
  CheckCircle2,
  Hash,
  Target,
  Layers,
  TrendingUp,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  Banknote
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getPayments, savePayment, deletePayment } from "@/lib/actions";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [customerEntities, setCustomerEntities] = useState<{subs: any[], deals: any[]}>({subs: [], deals: []});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    subscriptionId: "",
    dealId: "",
    docType: "DNI",
    docNumber: "",
    amount: "",
    method: "TRANSFER",
    status: "COMPLETED",
    paymentDate: new Date().toISOString().split('T')[0],
    notes: "",
    operationNumber: "",
    targetAccount: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setFormData({
      id: "",
      customerId: "",
      subscriptionId: "",
      dealId: "",
      docType: "DNI",
      docNumber: "",
      amount: "",
      method: "TRANSFER",
      status: "COMPLETED",
      paymentDate: new Date().toISOString().split('T')[0],
      notes: "",
      operationNumber: "",
      targetAccount: ""
    });
    setFoundCustomer(null);
    setCustomerEntities({subs: [], deals: []});
    setOpen(true);
  };

  const handleEdit = async (payment: any) => {
    setFormData({
      id: payment.id,
      customerId: payment.customerId,
      subscriptionId: payment.subscriptionId || "",
      dealId: payment.dealId || "",
      docType: "DNI", // No viene en el objeto payment directamente pero lo recuaremos con docNumber
      docNumber: payment.customerDoc || "",
      amount: payment.amount.toString(),
      method: payment.method,
      status: payment.status,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      notes: payment.notes || "",
      operationNumber: payment.operationNumber || "",
      targetAccount: payment.targetAccount || ""
    });

    // Cargar información del cliente y sus entidades
    setSearchingCustomer(true);
    try {
      const { getCustomerByDoc, getSubscriptionsByCustomer, getDealsByCustomer } = await import("@/lib/actions");
      const result = await getCustomerByDoc(payment.customerDoc);
      if (result.success && result.customer) {
        setFoundCustomer(result.customer);
        const [subs, deals] = await Promise.all([
           getSubscriptionsByCustomer(result.customer.id),
           getDealsByCustomer(result.customer.id)
        ]);
        setCustomerEntities({subs, deals});
      }
    } catch (e) {
      toast.error("Error al cargar datos del cliente.");
    } finally {
      setSearchingCustomer(false);
    }
    
    setOpen(true);
  };

  const handleSearchCustomer = async () => {
    if (!formData.docNumber) return;
    setSearchingCustomer(true);
    try {
      const { getCustomerByDoc, getSubscriptionsByCustomer, getDealsByCustomer } = await import("@/lib/actions");
      const result = await getCustomerByDoc(formData.docNumber);
      if (result.success && result.customer) {
        setFoundCustomer(result.customer);
        setFormData({ ...formData, customerId: result.customer.id });
        
        const [subs, deals] = await Promise.all([
           getSubscriptionsByCustomer(result.customer.id),
           getDealsByCustomer(result.customer.id)
        ]);
        setCustomerEntities({subs, deals});
        toast.success(`Identificado.`);
      } else {
        setFoundCustomer(null);
        setCustomerEntities({subs: [], deals: []});
        setFormData({ ...formData, customerId: "" });
        toast.error("No registrado.");
      }
    } catch (e) {
      toast.error("Error.");
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customerId || !formData.amount) {
      toast.error("Datos insuficientes.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePayment({
        id: formData.id || undefined,
        customerId: formData.customerId,
        subscriptionId: formData.subscriptionId || undefined,
        dealId: formData.dealId || undefined,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        operationNumber: formData.operationNumber,
        targetAccount: formData.targetAccount
      } as any);

      if (result.success) {
        toast.success("Correcto.");
        setOpen(false);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error crítico.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const result = await deletePayment(deleteId);
    if (result.success) {
      toast.success("Eliminado.");
      fetchData();
    } else {
      toast.error(result.error);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const filteredPayments = payments.filter(p => 
    (p.customerName && p.customerName.toLowerCase().includes(search.toLowerCase())) ||
    (p.operationNumber && p.operationNumber.toLowerCase().includes(search.toLowerCase())) ||
    (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Pagos y Tesorería</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Gestión Financiera • Conciliación de Ingresos</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              <Plus size={16} className="mr-2" />
              Registrar Cobro
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[700px] p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="px-7 py-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 text-left">
              <div className="flex flex-col">
                <DialogTitle className="text-lg text-zinc-950 font-semibold tracking-tight uppercase">
                  {formData.id ? 'Editar Registro' : 'Registro de Ingreso'}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[9px] mt-0.5 font-semibold uppercase tracking-widest">
                  {formData.id ? 'Modificar detalles de la transacción existente.' : 'Detalles de la transacción y vinculación de cuenta.'}
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="p-6 grid gap-4 max-h-[70vh] overflow-y-auto uppercase">
               {/* Buscar Cliente */}
               <div className="space-y-1.5 border-b border-zinc-100 pb-4">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Parte Originaria</Label>
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden h-10 bg-zinc-50/30">
                  <Input 
                    value={formData.docNumber}
                    onChange={e => {
                      setFormData({...formData, docNumber: e.target.value, customerId: ""});
                      setFoundCustomer(null);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearchCustomer()}
                    placeholder="..."
                    className="border-none bg-transparent h-full text-xs font-semibold focus-visible:ring-0 shadow-none uppercase flex-1 px-4"
                  />
                  <Button 
                    onClick={handleSearchCustomer} 
                    disabled={searchingCustomer}
                    type="button"
                    variant="secondary" 
                    className="h-full w-12 bg-zinc-900 hover:bg-black text-white border-l border-zinc-100 rounded-none transition-colors"
                  >
                    {searchingCustomer ? <Loader2 size={12} className="animate-spin" /> : <Search size={14} />}
                  </Button>
                </div>
                {foundCustomer && (
                  <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-sm">
                    <div className="flex items-center gap-3.5">
                       <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                         <CheckCircle2 size={16} className="text-emerald-600" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-zinc-950 uppercase tracking-tight">{foundCustomer.name}</span>
                          <span className="text-[9px] font-semibold text-emerald-600/70 uppercase tracking-widest">{foundCustomer.docType || "ID"}: {foundCustomer.docNumber}</span>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[9px] font-semibold text-zinc-900 uppercase tracking-widest">{foundCustomer.district || "UBICACIÓN NO DEF."}</span>
                      <span className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest">{foundCustomer.phone || "SIN TELÉFONO"}</span>
                    </div>
                  </div>
                )}
              </div>

              {foundCustomer && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                   <div className="space-y-1.5">
                      <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Vincular Suscripción</Label>
                      <Select value={formData.subscriptionId} onValueChange={v => setFormData({...formData, subscriptionId: v, dealId: ""})}>
                         <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-zinc-50/30 shadow-none">
                            <SelectValue placeholder="---" />
                         </SelectTrigger>
                         <SelectContent className="bg-white rounded-xl border-zinc-200">
                            {customerEntities.subs.map(s => (
                               <SelectItem key={s.id} value={s.id} className="text-[10px] font-bold uppercase py-2">{s.serviceName} (S/ {s.price})</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Vincular Contrato</Label>
                       <Select value={formData.dealId} onValueChange={v => {
                          const deal = customerEntities.deals.find(d => d.id === v);
                          const balance = deal ? Math.max(0, parseFloat(deal.totalAmount) - parseFloat(deal.paidAmount)) : 0;
                          setFormData({...formData, dealId: v, subscriptionId: "", amount: balance > 0 ? balance.toString() : formData.amount});
                       }}>
                          <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-zinc-50/30 shadow-none">
                             <SelectValue placeholder="---" />
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-xl border-zinc-200">
                             {customerEntities.deals.map(d => {
                                const balance = Math.max(0, parseFloat(d.totalAmount) - parseFloat(d.paidAmount));
                                return (
                                   <SelectItem key={d.id} value={d.id} className="text-[10px] font-bold uppercase py-2">
                                      {d.name} (SALDO: S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })})
                                   </SelectItem>
                                );
                             })}
                          </SelectContent>
                       </Select>
                    </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-1">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Monto de Ingreso (S/.)</Label>
                    <div className="relative">
                       <Input 
                          type="number" 
                          value={formData.amount} 
                          onChange={e => setFormData({...formData, amount: e.target.value})} 
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          className="pl-8 border-zinc-200 h-11 font-semibold bg-zinc-50/30" 
                       />
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">S/</span>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Medio / Canal</Label>
                    <Select value={formData.method} onValueChange={v => setFormData({...formData, method: v})}>
                       <SelectTrigger className="border-zinc-200 h-11 text-[10px] font-semibold uppercase text-left bg-zinc-50/30 shadow-none">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-white rounded-xl border-zinc-200">
                          <SelectItem value="TRANSFER" className="text-[10px] font-bold uppercase py-2">Transferencia</SelectItem>
                          <SelectItem value="YAPE" className="text-[10px] font-bold uppercase py-2">Yape / Plin</SelectItem>
                          <SelectItem value="CARD" className="text-[10px] font-bold uppercase py-2">Tarjeta</SelectItem>
                          <SelectItem value="CASH" className="text-[10px] font-bold uppercase py-2">Efectivo</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Fecha Valor</Label>
                    <Input type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="border-zinc-200 h-11 text-xs font-semibold uppercase bg-zinc-50/30 shadow-none" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-50 border border-zinc-100 p-5 rounded-2xl items-end mt-1 transition-all hover:border-zinc-200">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Nro de Operación</Label>
                    <Input value={formData.operationNumber} onChange={e => setFormData({...formData, operationNumber: e.target.value})} className="border-zinc-200 h-10 text-xs font-semibold bg-white rounded-xl shadow-none outline-none" />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Entidad / Cuenta Destino</Label>
                    <Input 
                       value={formData.targetAccount} 
                       onChange={e => setFormData({...formData, targetAccount: e.target.value})} 
                       placeholder="BCP, BBVA, etc." 
                       className="border-zinc-200 h-10 text-xs font-semibold bg-white rounded-xl shadow-none outline-none placeholder:font-normal placeholder:text-zinc-300" 
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Observaciones / Notas</Label>
                 <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="border-zinc-200 h-10 text-xs font-semibold bg-zinc-50/30 shadow-none" />
              </div>
            </div>
            
            <DialogFooter className="px-7 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3">
               <Button 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="text-zinc-500 font-semibold h-10 px-8 text-xs uppercase"
               >
                Cancelar
               </Button>
               <Button 
                  disabled={isSaving} 
                  onClick={handleSave} 
                  className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-10 rounded-xl text-xs uppercase tracking-widest"
               >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Confirmar Cobro"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Efectivo Consolidado</span>
               <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-zinc-900 tracking-tight">S/ {payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  <div className="p-1 bg-zinc-900 rounded-lg">
                    <TrendingUp size={12} className="text-white" />
                  </div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Registros de Cobro</span>
               <span className="text-xl font-bold text-zinc-900 tracking-tight">{payments.length}</span>
            </div>
         </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-zinc-100">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
              <Input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Filtrado por titular, nro de operación..." 
                className="pl-9 h-10 border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all rounded-xl"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Entidad Originaria</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Monto</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Trazabilidad</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Medio</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6">Opción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Sincronizando flujo de tesorería...</TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-[11px] font-semibold text-zinc-300 tracking-tight">
                    No se encontraron Pagos registrados
                  </TableCell>
                </TableRow>
              ) : paginatedPayments.map((payment) => (
                <TableRow key={payment.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors uppercase">
                  <TableCell className="py-4 pl-6">
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">{payment.customerName}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                         <div className="p-0.5 bg-zinc-100 rounded">
                           <Layers size={10} className="text-zinc-400" />
                         </div>
                         <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
                           {payment.serviceName || payment.dealName || "SIN VÍNCULO"}
                         </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col leading-tight">
                       <span className="text-sm font-bold text-zinc-900 tracking-tighter">S/ {payment.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                       <span className="text-[9px] text-zinc-400 font-semibold mt-1 uppercase">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                       {payment.operationNumber ? (
                         <div className="flex items-center gap-2">
                            <Hash size={10} className="text-zinc-300" />
                            <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-500">{payment.operationNumber}</span>
                         </div>
                       ) : null}
                       {payment.targetAccount ? (
                         <div className="flex items-center gap-2 translate-x-[2px]">
                            <Target size={10} className="text-zinc-300" />
                            <span className="text-[9px] font-bold text-zinc-400">{payment.targetAccount}</span>
                         </div>
                       ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge variant="outline" className="border-zinc-100 bg-zinc-50/80 text-zinc-500 py-0.5 px-3 text-[8px] font-bold uppercase tracking-tight shadow-none border-zinc-200 rounded-lg">
                        {payment.method}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border-none ring-0"><MoreHorizontal size={14} /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-2xl border-zinc-200 bg-white">
                             <DropdownMenuLabel className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest px-3 py-2 mt-0.5 leading-none">Tesorería</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                             <DropdownMenuItem 
                               onClick={() => handleEdit(payment)} 
                               className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-zinc-600 focus:text-zinc-900 focus:bg-zinc-50"
                             >
                                <Eye size={14} /> Editar Registro
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => { setDeleteId(payment.id); setDeleteOpen(true); }} 
                               className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                             >
                                <Trash2 size={14} /> Anular Registro
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </CardContent>
      </Card>

      {/* ALERT DIALOG ELIMINACIÓN */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-zinc-200 bg-white shadow-2xl p-0 overflow-hidden rounded-2xl sm:max-w-[400px]">
           <div className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-zinc-50 text-zinc-900 border border-zinc-100 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle size={24} strokeWidth={1.5} />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-zinc-900 uppercase tracking-tight">Anular Transacción</AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-2 leading-relaxed px-4">
                 ¿Confirmar anulación de este registro de ingreso? Esta operación afectará los saldos de tesorería.
              </AlertDialogDescription>
           </div>
           <AlertDialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-2">
              <AlertDialogCancel className="h-10 font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 mt-0 bg-white border-zinc-200">Abandonar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="h-10 bg-zinc-900 hover:bg-black text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 border-none shadow-sm">
                 Confirmar
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
