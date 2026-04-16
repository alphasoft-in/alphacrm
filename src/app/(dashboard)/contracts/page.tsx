"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Globe,
  DollarSign,
  Monitor,
  Camera,
  Briefcase,
  Edit,
  FileText,
  Gavel,
  CreditCard,
  Layers,
  FileBadge,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight
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
import { getDeals, saveDeal, deleteDeal, getCustomerByDoc, queryDocument, saveCustomer } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { ContractView } from "@/components/ContractView";

const DEFAULT_ALCANCE = "EL SERVICIO COMPRENDE EL DISEÑO, DESARROLLO, TESTEO Y DESPLIEGUE DEL PROYECTO TECNOLÓGICO SOLICITADO, INCLUYENDO LA CONFIGURACIÓN DE HOSTING Y DOMINIO SI FUERA NECESARIO, Y EL SOPORTE TÉCNICO POST-LANZAMIENTO POR UN PERIODO COORDINADO.";

export default function ContractsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [selectedForContract, setSelectedForContract] = useState<any>(null);

  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    docNumber: "",
    docType: "dni",
    name: "",
    description: DEFAULT_ALCANCE,
    totalAmount: "",
    downPayment: "",
    status: "OPEN",
    contactMethod: "WHATSAPP",
    paymentTerms: "50-50",
    installments: "1",
    dealDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getDeals();
    setDeals(data);
    setLoading(false);
  };

  const handleOpenNew = () => {
    setFormData({
      id: "",
      customerId: "",
      docNumber: "",
      docType: "dni",
      name: "",
      description: DEFAULT_ALCANCE,
      totalAmount: "",
      downPayment: "",
      status: "OPEN",
      contactMethod: "WHATSAPP",
      paymentTerms: "50-50",
      installments: "1",
      dealDate: new Date().toISOString().split('T')[0]
    });
    setFoundCustomer(null);
    setOpen(true);
  };

  const handleSearchCustomer = async () => {
    setSearchingCustomer(true);
    try {
      // 1. Local Search
      const localResult = await getCustomerByDoc(formData.docNumber);
      if (localResult.success && localResult.customer) {
        setFoundCustomer(localResult.customer);
        setFormData({ ...formData, customerId: localResult.customer.id });
        toast.success(`Identificado localmente.`);
        return;
      }

      // 2. External Search (RENIEC/SUNAT)
      if (formData.docType === 'dni' || formData.docType === 'ruc') {
        const extResult = await queryDocument(formData.docType, formData.docNumber);
        if (extResult.success && extResult.data) {
          const data = extResult.data;
          let name = "";
          let address = data.direccion || data.direccion_completa || "";
          let district = data.distrito || "";

          if (formData.docType === "dni") {
             name = data.nombre_completo || data.nombreCompleto || 
                   (data.nombres ? `${data.nombres} ${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim() : "");
          } else {
             name = data.nombre_o_razon_social || data.razon_social || data.razonSocial || data.nombre_comercial || data.nombreComercial;
             if (data.provincia && !district.includes(data.provincia)) {
                district = `${district}${district ? ', ' : ''}${data.provincia}`;
             }
          }

          if (name) {
             const virtualCustomer = {
                id: "NEW", // Marker for handleSave
                name: name.toUpperCase(),
                docType: formData.docType,
                docNumber: formData.docNumber,
                address: address?.toUpperCase(),
                district: district?.toUpperCase(),
                status: data.estado || "ACTIVO",
                condition: data.condicion || "HABIDO"
             };
             setFoundCustomer(virtualCustomer);
             setFormData({ ...formData, customerId: "NEW" });
             toast.success("Encontrado en API (No registrado)");
          } else {
             toast.error("No se pudo extraer el nombre.");
          }
        } else {
           toast.error(extResult.error || "No registrado ni encontrado.");
        }
      } else {
        toast.error("Documento no disponible para consulta externa.");
      }
    } catch (e) {
      toast.error("Error en búsqueda.");
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customerId || !formData.name || !formData.totalAmount) {
      toast.error("Datos insuficientes.");
      return;
    }

    setIsSaving(true);
    try {
      let finalCustomerId = formData.customerId;

      // Auto-register customer if found via API
      if (finalCustomerId === "NEW" && foundCustomer) {
         const regResult = await saveCustomer({
            name: foundCustomer.name,
            docType: foundCustomer.docType,
            docNumber: foundCustomer.docNumber,
            address: foundCustomer.address,
            district: foundCustomer.district,
            status: foundCustomer.status,
            condition: foundCustomer.condition,
            company: foundCustomer.name
         });
         if (regResult.success) {
            finalCustomerId = regResult.id || "";
         } else {
            toast.error("Error al registrar cliente: " + regResult.error);
            setIsSaving(false);
            return;
         }
      }

      const result = await saveDeal({
        id: formData.id || undefined,
        customerId: finalCustomerId,
        name: formData.name.toUpperCase(),
        description: formData.description.toUpperCase(),
        totalAmount: parseFloat(formData.totalAmount),
        downPayment: parseFloat(formData.downPayment || "0"),
        status: formData.status,
        contactMethod: formData.contactMethod,
        paymentTerms: formData.paymentTerms,
        installments: formData.installments,
        dealDate: formData.dealDate
      });

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
    const result = await deleteDeal(deleteId);
    if (result.success) {
      toast.success("Eliminado.");
      fetchData();
    } else {
      toast.error(result.error);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const filteredDeals = deals.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Contratos</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Instrumentos Legales • Acuerdos Comerciales</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              <Plus size={16} className="mr-2" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[850px] p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="px-7 py-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 text-left">
              <div className="flex flex-col">
                <DialogTitle className="text-lg text-zinc-950 font-semibold tracking-tight uppercase">
                  {formData.id ? "Actualizar Términos" : "Apertura Contractual"}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[9px] mt-0.5 font-semibold uppercase tracking-widest">
                  Parámetros legales y financieros del acuerdo.
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="p-6 grid gap-4 max-h-[70vh] overflow-y-auto uppercase">
               <div className="space-y-1.5">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Parte Contratante</Label>
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden h-12 bg-zinc-50/30 focus-within:border-zinc-400 transition-all shadow-sm">
                  <Select value={formData.docType} onValueChange={v => {
                    setFormData({...formData, docType: v, docNumber: "", customerId: ""});
                    setFoundCustomer(null);
                  }}>
                    <SelectTrigger className="w-[140px] border-none rounded-none font-bold text-xs focus:ring-0 uppercase h-full bg-zinc-100/50 border-r border-zinc-100 px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-100">
                      <SelectItem value="dni" className="text-xs uppercase font-bold">DNI</SelectItem>
                      <SelectItem value="ruc" className="text-xs uppercase font-bold">RUC</SelectItem>
                      <SelectItem value="ce" className="text-xs uppercase font-bold">C. Extranjería</SelectItem>
                      <SelectItem value="pasaporte" className="text-xs uppercase font-bold">Pasaporte</SelectItem>
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
                    className="border-none bg-transparent h-full text-sm font-bold tracking-tight focus-visible:ring-0 shadow-none uppercase flex-1 px-4"
                  />
                  <Button 
                    onClick={handleSearchCustomer} 
                    disabled={searchingCustomer}
                    type="button"
                    className="bg-zinc-900 border-none h-full w-12 rounded-none hover:bg-black transition-colors"
                  >
                    {searchingCustomer ? <Loader2 size={12} className="animate-spin text-white" /> : <Search size={14} className="text-white" />}
                  </Button>
                </div>
               </div>
                {foundCustomer && (
                  <div className="mt-1 p-4 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-sm">
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

                {formData.docType === 'dni' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       Dirección Legal (Obligatorio para Contrato)
                    </Label>
                    <Input 
                      value={foundCustomer?.address || ''} 
                      onChange={e => setFoundCustomer({...foundCustomer, address: e.target.value.toUpperCase()})}
                      placeholder="INGRESE LA DIRECCIÓN DOMICILIARIA..."
                      className="border-zinc-200 bg-zinc-50/30 h-11 !text-[10px] font-semibold uppercase shadow-none focus-within:border-zinc-400 text-zinc-900 placeholder:text-zinc-300 placeholder:!text-[10px]"
                    />
                  </div>
                )}

               {/* Detalles del Servicio */}
               <div className="grid gap-4">
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Título del Proyecto</Label>
                     <Input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                        className="border-zinc-200 bg-zinc-50/30 h-11 text-sm font-semibold shadow-none outline-none uppercase"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Alcance y Cláusulas</Label>
                     <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
                        className="w-full border border-zinc-200 bg-zinc-50/30 min-h-[110px] p-4 text-[11px] font-medium rounded-xl focus:outline-none transition-all outline-none uppercase leading-relaxed resize-none"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Inversión Pactada (S/.)</Label>
                      <div className="relative">
                         <Input 
                            type="number"
                            value={formData.totalAmount}
                            onChange={e => {
                                const val = e.target.value;
                                setFormData({
                                    ...formData, 
                                    totalAmount: val,
                                    downPayment: formData.paymentTerms === '50-50' ? (parseFloat(val) / 2).toString() : formData.downPayment
                                });
                            }}
                            className="pl-8 border-zinc-200 h-11 font-bold text-sm bg-zinc-50/30" 
                         />
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">S/</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Fecha de Firma</Label>
                        <Input type="date" value={formData.dealDate} onChange={e => setFormData({...formData, dealDate: e.target.value})} className="border-zinc-200 h-11 text-xs font-bold uppercase bg-zinc-50/30" />
                     </div>
                  </div>

                  {/* Financial Section */}
                  <div className="grid grid-cols-4 gap-4 bg-zinc-50 border border-zinc-100 p-5 rounded-2xl items-end mt-2 transition-all hover:border-zinc-200">
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Esquema Pago</Label>
                        <Select value={formData.paymentTerms} onValueChange={v => {
                             const is50 = v === '50-50';
                             const total = parseFloat(formData.totalAmount) || 0;
                             setFormData({...formData, paymentTerms: v, downPayment: is50 ? (total/2).toString() : formData.downPayment});
                        }}>
                           <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-white rounded-xl shadow-none outline-none">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-white rounded-xl border-zinc-200">
                              <SelectItem value="50-50" className="text-[10px] font-bold uppercase">50% / 50%</SelectItem>
                              <SelectItem value="INSTALLMENTS" className="text-[10px] font-bold uppercase">Inicial + Cuotas</SelectItem>
                              <SelectItem value="TOTAL" className="text-[10px] font-bold uppercase">Total Anticipado</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-1.5">
                          <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Inicial (S/.)</Label>
                          <div className="relative">
                             <Input 
                                type="number"
                                disabled={formData.paymentTerms === 'TOTAL'}
                                value={formData.downPayment}
                                onChange={e => setFormData({...formData, downPayment: e.target.value})}
                                className="pl-8 border-zinc-200 h-10 font-bold text-sm bg-white rounded-xl shadow-none outline-none w-full" 
                             />
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">S/</span>
                          </div>
                     </div>

                     {formData.paymentTerms === "INSTALLMENTS" ? (
                       <>
                         <div className="space-y-1.5 animate-in zoom-in-95 duration-200">
                            <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">N° Cuotas</Label>
                            <Select value={formData.installments} onValueChange={v => setFormData({...formData, installments: v})}>
                               <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-white rounded-xl shadow-none outline-none">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-white rounded-xl border-zinc-200">
                                  <SelectItem value="1" className="font-bold">1 CUOTA</SelectItem>
                                  <SelectItem value="2" className="font-bold">2 CUOTAS</SelectItem>
                                  <SelectItem value="3" className="font-bold">3 CUOTAS</SelectItem>
                                  <SelectItem value="4" className="font-bold">4 CUOTAS</SelectItem>
                                  <SelectItem value="5" className="font-bold">5 CUOTAS</SelectItem>
                                  <SelectItem value="6" className="font-bold">6 CUOTAS</SelectItem>
                                  <SelectItem value="8" className="font-bold">8 CUOTAS</SelectItem>
                                  <SelectItem value="10" className="font-bold">10 CUOTAS</SelectItem>
                                  <SelectItem value="12" className="font-bold">12 CUOTAS</SelectItem>
                                  <SelectItem value="24" className="font-bold">24 CUOTAS</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Origen</Label>
                            <Select value={formData.contactMethod} onValueChange={v => setFormData({...formData, contactMethod: v})}>
                               <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-white rounded-xl shadow-none outline-none">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-white rounded-xl border-zinc-200">
                                  <SelectItem value="WHATSAPP" className="text-[10px] font-bold uppercase">WhatsApp</SelectItem>
                                  <SelectItem value="FACEBOOK" className="text-[10px] font-bold uppercase">Facebook</SelectItem>
                                  <SelectItem value="INSTAGRAM" className="text-[10px] font-bold uppercase">Instagram</SelectItem>
                                  <SelectItem value="REFERAL" className="text-[10px] font-bold uppercase">Recomendación</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                       </>
                     ) : (
                       <div className="space-y-1.5 col-span-2">
                           <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Canal de Contacto</Label>
                           <Select value={formData.contactMethod} onValueChange={v => setFormData({...formData, contactMethod: v})}>
                              <SelectTrigger className="border-zinc-200 h-10 text-[10px] font-bold uppercase bg-white rounded-xl shadow-none outline-none w-full">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white rounded-xl border-zinc-200">
                                 <SelectItem value="WHATSAPP" className="text-[10px] font-bold uppercase">WhatsApp</SelectItem>
                                 <SelectItem value="FACEBOOK" className="text-[10px] font-bold uppercase">Facebook</SelectItem>
                                 <SelectItem value="INSTAGRAM" className="text-[10px] font-bold uppercase">Instagram</SelectItem>
                                 <SelectItem value="REFERAL" className="text-[10px] font-bold uppercase">Recomendación</SelectItem>
                              </SelectContent>
                           </Select>
                       </div>
                     )}
                  </div>
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
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : (formData.id ? "Actualizar" : "Verificar y Abrir")}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Cartera Contractual</span>
               <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-zinc-900 tracking-tight">S/ {deals.reduce((sum, d) => sum + d.totalAmount, 0).toLocaleString()}</span>
                  <div className="p-1 bg-emerald-50 rounded-lg">
                    <TrendingUp size={12} className="text-emerald-500" />
                  </div>
               </div>
            </div>
         </div>
         <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Documentos Generados</span>
               <span className="text-xl font-bold text-zinc-900 tracking-tight">{deals.length}</span>
            </div>
         </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-zinc-100">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <Input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Filtrado por proyecto o titular..." 
                className="pl-9 h-10 border-none bg-zinc-50/50 text-xs font-semibold uppercase"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Proyecto / Titular</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center">Esquema Financiero</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-right">Amortización (Avance)</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6">Opción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Sincronizando expedientes legales...</TableCell>
                </TableRow>
              ) : filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[10px] font-semibold text-zinc-300 uppercase tracking-widest italic">Sin registros en base</TableCell>
                </TableRow>
              ) : filteredDeals.map((deal) => {
                const paid = parseFloat(deal.paidAmount || 0);
                const progress = (paid / deal.totalAmount) * 100;
                return (
                  <TableRow key={deal.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors uppercase">
                    <TableCell className="py-5 pl-6">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-zinc-900 tracking-tight">{deal.name}</span>
                        <span className="text-[9px] font-semibold text-zinc-400 mt-1.5 uppercase tracking-widest">{deal.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className="border-zinc-100 bg-zinc-50/80 text-zinc-500 gap-1.5 py-0.5 px-3 text-[8px] font-bold uppercase tracking-tight shadow-none border-zinc-200 rounded-lg">
                          <CreditCard size={10} />
                          {deal.paymentTerms === '50-50' ? '50% / 50%' : deal.paymentTerms === 'INSTALLMENTS' ? `${deal.installments} CUOTAS` : 'ADELANTADO'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex flex-col items-end gap-1.5">
                          <div className="text-[11px] font-bold text-zinc-900 tracking-tighter">S/ {paid.toLocaleString()} <span className="text-zinc-400 font-semibold">/ S/ {deal.totalAmount.toLocaleString()}</span></div>
                          <div className="w-28 bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-100/50">
                             <div 
                               className={cn(
                                 "h-full transition-all duration-700 ease-out",
                                 progress >= 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-zinc-900"
                               )} 
                               style={{ width: `${Math.min(progress, 100)}%` }} 
                             />
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border-none ring-0"><MoreHorizontal size={14} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl border-zinc-200 bg-white">
                             <DropdownMenuLabel className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest px-3 py-2 mt-0.5 leading-none">Gestión Técnica</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                             
                             <DropdownMenuItem onClick={() => setSelectedForContract(deal)} className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-zinc-900 hover:bg-zinc-50 focus:bg-zinc-50">
                                <FileText size={14} className="text-zinc-400" /> 
                                <span className="flex-1">Generar Contrato (PDF)</span>
                                <ArrowUpRight size={12} className="text-zinc-300" />
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setFormData({
                                 id: deal.id,
                                 customerId: deal.customerId,
                                 docNumber: deal.docNumber || "", 
                                 docType: deal.docType || "dni",
                                 name: deal.name.toUpperCase(),
                                 description: (deal.description || DEFAULT_ALCANCE).toUpperCase(),
                                 totalAmount: deal.totalAmount.toString(),
                                 downPayment: (deal.downPayment || 0).toString(),
                                 status: deal.status,
                                 contactMethod: deal.contactMethod,
                                 paymentTerms: deal.paymentTerms || "50-50",
                                 installments: (deal.installments || 1).toString(),
                                 dealDate: deal.dealDate ? new Date(deal.dealDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                               });
                               setFoundCustomer({id: deal.customerId, name: deal.customerName, address: deal.address, docNumber: deal.docNumber, docType: deal.docType});
                               setOpen(true);
                             }} className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-zinc-600 hover:bg-zinc-50 focus:bg-zinc-50">
                                <Edit size={14} className="text-zinc-400" /> Editar Términos
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                             <DropdownMenuItem 
                              onClick={() => { setDeleteId(deal.id); setDeleteOpen(true); }} 
                              className="gap-2.5 text-[10px] font-semibold py-2.5 rounded-lg px-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                             >
                                <Trash2 size={14} /> Eliminar Registro
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ALERT DIALOG ELIMINACIÓN */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-zinc-200 bg-white shadow-2xl p-0 overflow-hidden rounded-2xl sm:max-w-[400px]">
           <div className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-zinc-50 text-zinc-900 border border-zinc-100 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle size={24} strokeWidth={1.5} />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-zinc-900 uppercase tracking-tight">Anular Acuerdo</AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-2 leading-relaxed px-4">
                 ¿Confirmar eliminación de este registro contractual? Esta operación es irreversible.
              </AlertDialogDescription>
           </div>
           <AlertDialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-2">
              <AlertDialogCancel className="h-10 font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 mt-0 bg-white">Cerrar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="h-10 bg-zinc-900 hover:bg-black text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl flex-1 border-none shadow-sm">
                 Confirmar
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contract Generation Modal Overlay */}
      {selectedForContract && (
        <ContractView 
          contract={selectedForContract} 
          onClose={() => setSelectedForContract(null)} 
        />
      )}
    </div>
  );
}
