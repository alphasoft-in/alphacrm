"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar,
  Layers,
  Trash2,
  Eye,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
  Package,
  User,
  Clock,
  ArrowRight,
  Pencil,
  AlertTriangle,
  Zap,
  TrendingDown,
  Ticket,
  Copy,
  RefreshCw,
  Filter,
  Percent
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
import { getSubscriptions, saveSubscription, getServices, getCustomerByDoc, deleteSubscription } from "@/lib/actions";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);

  // Estados para Cupones Personalizados
  const [couponType, setCouponType] = useState("TRIMESTRAL");
  const [customDiscount, setCustomDiscount] = useState("10"); 
  const [generatedCode, setGeneratedCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    serviceId: "",
    docType: "dni",
    docNumber: "",
    startDate: new Date().toISOString().split('T')[0],
    price: "",
    productName: "",
    status: "ACTIVE",
    discountCode: "",
    months: "1"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [subData, serData] = await Promise.all([getSubscriptions(), getServices()]);
    setSubscriptions(subData);
    setServices(serData);
    setCurrentPage(1);
    setLoading(false);
  };

  const generateCoupon = () => {
    if (!customDiscount || isNaN(Number(customDiscount))) {
      toast.error("Ingresa un porcentaje válido.");
      return;
    }
    const prefix = couponType.slice(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}${customDiscount}-${random}-ALP`;
    setGeneratedCode(code);
    toast.success(`Cupón de ${customDiscount}% generado.`);
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.info("Código copiado.");
  };

  const handleOpenNew = () => {
    setFormData({
      id: "",
      customerId: "",
      serviceId: "",
      docType: "dni",
      docNumber: "",
      startDate: new Date().toISOString().split('T')[0],
      price: "",
      productName: "",
      status: "ACTIVE",
      discountCode: "",
      months: "1"
    });
    setFoundCustomer(null);
    setOpen(true);
  };

  const handleEdit = (sub: any) => {
    const formattedDocType = (sub.docType || "dni").trim().toLowerCase();
    setFormData({
      id: sub.id,
      customerId: sub.customerId,
      serviceId: sub.serviceId,
      docType: formattedDocType, 
      docNumber: (sub.docNumber || "").trim(), 
      startDate: new Date(sub.startDate).toISOString().split('T')[0],
      price: sub.price ? sub.price.toString() : "",
      productName: sub.productName || "",
      status: sub.status,
      discountCode: sub.discountCode || "",
      months: (sub.months || 1).toString()
    });
    setFoundCustomer({ 
      id: sub.customerId, 
      name: sub.customerName,
      docType: formattedDocType,
      docNumber: sub.docNumber
    });
    setOpen(true);
  };

  const handleView = (sub: any) => {
    setSelectedSub(sub);
    setViewOpen(true);
  };

  const handleSearchCustomer = async () => {
    if (!formData.docNumber) return;
    setSearchingCustomer(true);
    try {
      const result = await getCustomerByDoc(formData.docNumber);
      if (result.success && result.customer) {
        setFoundCustomer(result.customer);
        setFormData({ ...formData, customerId: result.customer.id });
        toast.success(`Cliente: ${result.customer.name}`);
      } else {
        setFoundCustomer(null);
        setFormData({ ...formData, customerId: "" });
        toast.error("Cliente no registrado.");
      }
    } catch (e) {
      toast.error("Error en plataforma.");
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customerId || !formData.serviceId) {
      toast.error("Datos insuficientes.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveSubscription({
        id: formData.id || undefined,
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        startDate: formData.startDate,
        status: formData.status,
        productName: formData.productName,
        price: formData.price ? parseFloat(formData.price) : undefined,
        discountCode: formData.discountCode,
        months: formData.months
      });

      if (result.success) {
        toast.success("Registro sincronizado.");
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
    const result = await deleteSubscription(deleteId);
    if (result.success) {
      toast.success("Vínculo eliminado.");
      fetchData();
    } else {
      toast.error(result.error);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };
  
  const getCycleText = (cycle: string) => {
    switch (cycle) {
      case "MONTHLY": return "Mensual";
      case "QUARTERLY": return "Trimestral";
      case "SEMI_ANNUAL": return "Semestral";
      case "ANNUAL": return "Anual";
      default: return cycle;
    }
  };

  const filteredSubs = subscriptions.filter(s => 
    s.customerName.toLowerCase().includes(search.toLowerCase()) ||
    s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    (s.productName && s.productName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const paginatedSubs = filteredSubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Suscripciones</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Control Contractual • Gestión de Servicios</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              <Plus size={16} className="mr-2" />
              Nueva Suscripción
            </Button>
          </DialogTrigger>
          <DialogContent 
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[650px] p-0 overflow-hidden rounded-2xl max-h-[95vh] flex flex-col"
          >
            <DialogHeader className="px-7 py-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 text-left">
              <div className="flex flex-col">
                <DialogTitle className="text-lg text-zinc-950 font-semibold tracking-tight uppercase">
                  {formData.id ? "Editar Vínculo" : "Vinculación de Servicio"}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[9px] mt-0.5 font-semibold uppercase tracking-widest">
                  Parámetros del contrato activo
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="p-5 grid gap-3 flex-1 overflow-y-auto custom-scrollbar">
              {/* Cliente */}
              <div className="space-y-1.5">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Identificar Cliente</Label>
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden h-12 bg-white focus-within:border-zinc-400 transition-all shadow-sm focus-within:shadow-md">
                  <Select value={formData.docType} onValueChange={v => setFormData({...formData, docType: v})}>
                    <SelectTrigger className="w-[110px] border-none rounded-none font-semibold text-xs focus:ring-0 uppercase h-full bg-zinc-50/50 border-r border-zinc-100 px-4 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni" className="text-xs uppercase font-semibold">DNI</SelectItem>
                      <SelectItem value="ruc" className="text-xs uppercase font-semibold">RUC</SelectItem>
                      <SelectItem value="ce" className="text-xs uppercase font-semibold">C. Extranjería</SelectItem>
                      <SelectItem value="pasaporte" className="text-xs uppercase font-semibold">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    value={formData.docNumber}
                    onChange={e => {
                      setFormData({...formData, docNumber: e.target.value, customerId: ""});
                      setFoundCustomer(null);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearchCustomer()}
                    placeholder="..."
                    className="border-none bg-transparent h-full text-sm font-medium tracking-tight focus-visible:ring-0 flex-1 px-5 shadow-none"
                  />
                  <Button 
                    onClick={handleSearchCustomer} 
                    disabled={searchingCustomer}
                    type="button"
                    className="bg-zinc-900 border-none h-full w-14 rounded-none hover:bg-black transition-colors"
                  >
                    {searchingCustomer ? <Loader2 size={14} className="animate-spin" /> : <Search size={16} className="text-white" />}
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

              {/* Servicio */}
              <div className="space-y-1.5">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Catálogo de Servicios</Label>
                <Select value={formData.serviceId} onValueChange={v => {
                  const s = services.find(ser => ser.id === v);
                  setFormData({...formData, serviceId: v, price: s ? s.basePrice.toString() : formData.price});
                }}>
                  <SelectTrigger className="border-zinc-200 h-10 text-xs font-semibold bg-zinc-50/30 rounded-xl shadow-none">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-100 bg-white">
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs font-semibold py-2">
                        {s.name} - S/ {s.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Identificador / Dominio</Label>
                  <Input 
                    value={formData.productName}
                    onChange={e => setFormData({...formData, productName: e.target.value})}
                    className="border-zinc-100 h-10 text-sm font-semibold bg-zinc-50/30 shadow-none" 
                  />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Fecha de Inicio</Label>
                   <Input 
                     type="date"
                     value={formData.startDate}
                     onChange={e => setFormData({...formData, startDate: e.target.value})}
                     className="border-zinc-100 h-10 text-xs font-semibold bg-zinc-50/30 shadow-none" 
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Meses Contratados</Label>
                   <Select value={formData.months} onValueChange={v => setFormData({...formData, months: v})}>
                      <SelectTrigger className="border-zinc-200 h-10 text-[11px] font-semibold bg-zinc-50/30 rounded-xl px-4 shadow-none">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-100 bg-white">
                         {[1,2,3,4,5,6,12,24].map(m => (
                           <SelectItem key={m} value={m.toString()} className="text-xs font-semibold">{m} {m === 1 ? 'Mes' : 'Meses'}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Monto Final (S/.)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className="pl-8 border-zinc-200 h-10 text-xs font-bold bg-zinc-50/30 rounded-xl shadow-none" 
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">S/</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Código de Oferta / Cupón</Label>
                <Input 
                  placeholder="PROMOCIÓN O REFERENCIA DE DESCUENTO..."
                  value={formData.discountCode}
                  onChange={e => setFormData({...formData, discountCode: e.target.value})}
                  className="border-zinc-200 h-10 text-[10px] font-semibold bg-zinc-50/30 uppercase rounded-xl px-4 shadow-none placeholder:text-[8px] placeholder:font-medium placeholder:tracking-wider" 
                />
              </div>

              {/* Cálculo Rápido de Costo */}
              {formData.serviceId && (() => {
                const service = services.find(s => s.id === formData.serviceId);
                const months = parseInt(formData.months?.toString() || "1");
                const rawBasePrice = service?.basePrice || 0;
                const billingCycle = service?.billingCycle || 'MONTHLY';
                const taxStatus = service?.taxStatus || 'INC_IGV';
                
                // Determinar costo base mensual real según el ciclo del servicio
                let basePricePerMonth = rawBasePrice;
                let cycleLabel = "Mensual";

                if (billingCycle === 'ANNUAL') {
                  basePricePerMonth = rawBasePrice / 12;
                  cycleLabel = "Anual";
                } else if (billingCycle === 'QUARTERLY') {
                  basePricePerMonth = rawBasePrice / 3;
                  cycleLabel = "Trimestral";
                } else if (billingCycle === 'SEMI_ANNUAL') {
                  basePricePerMonth = rawBasePrice / 6;
                  cycleLabel = "Semestral";
                }

                const totalPeriodPrice = basePricePerMonth * months;
                
                let subtotal = totalPeriodPrice;
                let igvAmount = 0;
                let total = totalPeriodPrice;

                if (taxStatus === 'INC_IGV') {
                   subtotal = totalPeriodPrice / 1.18;
                   igvAmount = totalPeriodPrice - subtotal;
                } else if (taxStatus === 'PLUS_IGV') {
                   igvAmount = totalPeriodPrice * 0.18;
                   total = totalPeriodPrice + igvAmount;
                }

                return (
                  <div className="border border-zinc-100 bg-zinc-50/30 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[9px] font-medium uppercase tracking-widest">Costo Base ({cycleLabel})</span>
                      <span className="text-[9px] font-medium tracking-tight">
                        S/ {parseFloat(rawBasePrice).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Subtotal ({months} {months === 1 ? 'Mes' : 'Meses'})</span>
                      <span className="text-xs font-medium text-zinc-900 tracking-tight">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">
                        IGV (18%) {taxStatus === 'INC_IGV' && <span className="text-[8px] lowercase font-normal">(incluido)</span>}
                      </span>
                      <span className="text-xs font-medium text-zinc-500 tracking-tight">
                        S/ {igvAmount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                      <span className="text-[9px] font-semibold text-zinc-900 uppercase tracking-widest">Total Estimado</span>
                      <span className="text-base font-semibold text-zinc-950 tracking-tighter">
                        S/ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <DialogFooter className="px-7 py-4 bg-zinc-50/50 border-t border-zinc-100 mt-1">
               <Button 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="text-zinc-500 font-semibold h-10 px-6 text-xs uppercase"
               >
                Cancelar
               </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-8 rounded-xl text-xs uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : (formData.id ? "Actualizar" : "Verificar y Guardar")}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Métricas Compactas */}
      <div className="grid gap-4 md:grid-cols-4 px-1">
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Suscripciones Totales</span>
               <span className="text-xl font-bold text-zinc-900 tracking-tight">{subscriptions.length}</span>
            </div>
         </div>
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Flujos Activos</span>
               <span className="text-xl font-bold text-emerald-600 tracking-tight">{subscriptions.filter(s => s.status === 'ACTIVE').length}</span>
            </div>
         </div>
      </div>

      {/* Gestor de Cupones Platinum - CUSTOMIZABLE (V0) */}
      <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-zinc-200">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-zinc-400 shadow-sm border border-zinc-100">
               <Ticket size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
               <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-tight">Estrategia de Incentivos</h3>
               <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1">Generador de cupones personalizados</p>
            </div>
         </div>

         <div className="flex items-center gap-3">
            {generatedCode ? (
               <div className="flex items-center bg-white border border-zinc-200 pl-4 pr-1 h-10 rounded-xl animate-in fade-in zoom-in duration-300">
                  <span className="text-xs font-bold text-zinc-900 tracking-widest mr-4">{generatedCode}</span>
                  <div className="flex gap-1">
                     <Button onClick={copyCode} variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 p-0 rounded-lg">
                        <Copy size={14} />
                     </Button>
                     <Button onClick={() => setGeneratedCode("")} variant="ghost" className="h-8 w-8 text-zinc-300 hover:text-zinc-900 p-0 rounded-lg">
                        <RefreshCw size={14} />
                     </Button>
                  </div>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                  {/* Selector de Periodo */}
                  <Select value={couponType} onValueChange={setCouponType}>
                     <SelectTrigger className="w-40 h-10 border-zinc-200 text-[10px] font-semibold uppercase tracking-widest bg-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="TRIMESTRAL" className="text-[10px] font-semibold uppercase">TRIMESTRAL</SelectItem>
                        <SelectItem value="SEMESTRAL" className="text-[10px] font-semibold uppercase">SEMESTRAL</SelectItem>
                        <SelectItem value="ANUAL" className="text-[10px] font-semibold uppercase">ANUAL</SelectItem>
                     </SelectContent>
                  </Select>

                  {/* Input de Porcentaje */}
                  <div className="relative flex items-center group">
                    <Input 
                      type="number"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(e.target.value)}
                      className="w-20 h-10 border-zinc-200 bg-white pr-7 text-xs font-bold text-center focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all rounded-xl"
                      placeholder="%"
                    />
                    <Percent size={12} className="absolute right-3 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                  </div>

                  <Button 
                    onClick={generateCoupon}
                    className="h-10 bg-zinc-900 hover:bg-black text-white px-6 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all"
                  >
                     Emitir Código
                  </Button>
               </div>
            )}
         </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 gap-4">
          <div className="relative group flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
             <Input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Filtrado por cliente o servicio..." 
               className="pl-9 h-10 border-zinc-200 bg-zinc-50/50 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all rounded-xl"
             />
          </div>
          <Button variant="outline" className="h-10 border-zinc-200 text-zinc-600 rounded-xl text-xs font-medium px-4">
             <Filter size={14} className="mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Entidad / Cliente</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Servicio</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Inversión</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Ciclo</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Estado</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6">Opción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Sincronizando flujo contractual...</TableCell>
                </TableRow>
              ) : paginatedSubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-[11px] font-semibold text-zinc-300 tracking-tight">
                    No se encontraron Suscripciones
                  </TableCell>
                </TableRow>
              ) : paginatedSubs.map(sub => (
                <TableRow key={sub.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-[10px]">
                          {sub.customerName?.charAt(0)}
                       </div>
                       <span className="text-xs font-semibold text-zinc-900 leading-tight uppercase min-w-0 flex-1">{sub.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col leading-tight">
                       <span className="text-zinc-600 font-semibold text-[11px] uppercase tracking-tight">{sub.serviceName}</span>
                       {sub.productName && <span className="text-[9px] text-zinc-400 font-medium uppercase mt-0.5">{sub.productName}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[11px] font-bold text-zinc-900">S/ {sub.price ? sub.price.toFixed(2) : "0.00"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[8px] font-semibold text-zinc-400 bg-white border-zinc-100 px-2 py-0 uppercase">
                       {getCycleText(sub.billingCycle)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center flex-col items-center gap-1">
                      <div className={`h-1 w-6 rounded-full ${sub.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
                      <span className="text-[8px] font-semibold uppercase tracking-widest text-zinc-400">
                        {sub.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border-none ring-0">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                        <DropdownMenuLabel className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 px-2 py-1.5">Expediente</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleView(sub)} className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer">
                          <Eye size={14} className="text-zinc-400" /> Ficha Técnica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(sub)} className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer">
                          <Pencil size={14} className="text-zinc-400" /> Editar Vínculo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                        <DropdownMenuItem 
                          onClick={() => { setDeleteId(sub.id); setDeleteOpen(true); }} 
                          className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 size={14} /> Eliminar Registro
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
              <AlertDialogTitle className="text-lg font-semibold text-zinc-900 uppercase tracking-tight">Cerrar Vínculo</AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-2 leading-relaxed px-4">
                 ¿Confirmar eliminación de este registro contractual? Esta operación es irreversible.
              </AlertDialogDescription>
           </div>
           <AlertDialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-2">
              <AlertDialogCancel className="h-10 font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 mt-0 bg-white">Abandonar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="h-10 bg-zinc-900 hover:bg-black text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 border-none">
                 Confirmar
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FICHA TÉCNICA (Read Only) */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-2xl">
          <DialogHeader className="px-8 py-6 bg-zinc-900 text-white flex flex-row items-center gap-4 space-y-0 text-left">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Layers size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-semibold tracking-tight uppercase leading-none">
                Ficha Contractual
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-[10px] mt-1.5 font-semibold uppercase tracking-widest">
                Identificador: {selectedSub?.id?.slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="p-8 grid gap-6 bg-white">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Entidad Solicitante</p>
                   <p className="text-sm font-semibold text-zinc-900 uppercase tracking-tight">{selectedSub?.customerName}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Servicio Desplegado</p>
                   <p className="text-sm font-semibold text-zinc-900 uppercase tracking-tight">{selectedSub?.serviceName}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Indicador / Dominio</p>
                   <p className="text-xs font-bold text-zinc-700">{selectedSub?.productName || "NO DEFINIDO"}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Inversión Pactada</p>
                   <p className="text-sm font-bold text-zinc-900">S/ {selectedSub?.price?.toFixed(2)}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-100">
                <div className="space-y-1">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Activación</p>
                   <p className="text-[11px] font-semibold text-zinc-700">{selectedSub?.startDate && new Date(selectedSub.startDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Estado</p>
                   <Badge className={selectedSub?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-none h-5 text-[8px]' : 'bg-zinc-100 text-zinc-500 h-5 text-[8px]'}>
                      {selectedSub?.status}
                   </Badge>
                </div>
             </div>
          </div>
          
          <DialogFooter className="px-8 py-6 bg-zinc-50 border-t border-zinc-100">
             <Button variant="outline" onClick={() => setViewOpen(false)} className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest rounded-xl bg-white border-zinc-200">
                Cerrar Expediente
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
