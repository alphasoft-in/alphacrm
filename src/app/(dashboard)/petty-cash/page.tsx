"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar,
  Wallet,
  ArrowDownCircle, 
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  Pencil,
  PlusCircle,
  Loader2,
  Filter,
  Layers,
  ShoppingBag,
  Coffee,
  Zap,
  Tag,
  AlertCircle,
  User,
  CheckCircle2,
  SearchCode
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPettyCashMovements, savePettyCashMovement, deletePettyCashMovement, getCustomerByDoc, queryDocument } from "@/lib/actions";

export default function PettyCashPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados para búsqueda de cliente
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [customerSubscriptions, setCustomerSubscriptions] = useState<any[]>([]);
  const [isFoundInApi, setIsFoundInApi] = useState(false);
  const [docSearch, setDocSearch] = useState({ type: 'dni', number: '' });

  const [formData, setFormData] = useState({
    id: "",
    description: "",
    amount: "",
    type: "EXPENSE",
    category: "VARIOS",
    customerId: "",
    customerName: "",
    subscriptionId: "",
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: "VARIOS", label: "Varios", icon: <Tag size={12} /> },
    { value: "OFICINA", label: "Oficina", icon: <Layers size={12} /> },
    { value: "SERVICIOS", label: "Servicios", icon: <Zap size={12} /> },
    { value: "ALIMENTACION", label: "Alimentación", icon: <Coffee size={12} /> },
    { value: "COMPRAS", label: "Compras", icon: <ShoppingBag size={12} /> },
    { value: "AMORTIZACION", label: "Amortización", icon: <ArrowUpCircle size={12} /> },
    { value: "SISTEMAS", label: "Sistemas", icon: <Layers size={12} /> },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPettyCashMovements();
      setMovements(data);
      setCurrentPage(1);
    } catch (e) {
      toast.error("Error al obtener movimientos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchCustomer = async () => {
    const trimmedDoc = docSearch.number.trim();
    if (!trimmedDoc) return;
    setSearchingCustomer(true);
    setIsFoundInApi(false);
    setCustomerSubscriptions([]);
    try {
      // 1. Buscar en BD local
      const result = await getCustomerByDoc(trimmedDoc);
      if (result.success && result.customer) {
        setFoundCustomer(result.customer);
        setCustomerSubscriptions(result.subscriptions || []);
        setFormData({ ...formData, customerId: result.customer.id, customerName: result.customer.name });
        toast.success(`Identificado localmente.`);
        return;
      }

      // 2. Si no existe en BD, consultar API (RENIEC/SUNAT)
      if (docSearch.type === 'dni' || docSearch.type === 'ruc') {
        toast.info("Consultando API externa...");
        const extResult = await queryDocument(docSearch.type as 'dni' | 'ruc', trimmedDoc);
        
        if (extResult.success && extResult.data) {
          const data = extResult.data;
          let name = "";

          if (docSearch.type === "dni") {
             name = data.nombre_completo || data.nombreCompleto || 
                   (data.nombres ? `${data.nombres} ${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim() : "");
          } else {
             name = data.nombre_o_razon_social || data.razon_social || data.razonSocial || data.nombre_comercial || data.nombreComercial;
          }

          if (name) {
            setFoundCustomer({ name, isApi: true });
            setIsFoundInApi(true);
            setFormData({ ...formData, customerId: "", customerName: name.toUpperCase() });
            toast.success("Documento verificado vía API.");
          } else {
            toast.error("No se pudo extraer el nombre.");
          }
        } else {
          toast.error(extResult.error || "No encontrado en API.");
        }
      } else {
        toast.error("Tipo de documento no consultable.");
      }
    } catch (e: any) {
      toast.error("Error en búsqueda.");
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleOpenNew = () => {
    setFormData({
      id: "",
      description: "",
      amount: "",
      type: "INCOME",
      category: "AMORTIZACION",
      customerId: "",
      customerName: "",
      subscriptionId: "",
      date: new Date().toISOString().split('T')[0]
    });
    setFoundCustomer(null);
    setCustomerSubscriptions([]);
    setDocSearch({ type: 'dni', number: '' });
    setOpen(true);
  };

  const handleEdit = (m: any) => {
    setFormData({
      id: m.id,
      description: m.description,
      amount: m.amount.toString(),
      type: m.type,
      category: m.category,
      customerId: m.customerId || "",
      customerName: m.customerName || "",
      subscriptionId: m.subscriptionId || "",
      date: new Date(m.date).toISOString().split('T')[0]
    });
    if (m.linkedCustomerName) {
      setFoundCustomer({ name: m.linkedCustomerName, id: m.customerId });
    } else {
      setFoundCustomer(null);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      toast.error("Complete los campos obligatorios.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await savePettyCashMovement(formData);
      if (result.success) {
        toast.success(formData.id ? "Movimiento actualizado." : "Gasto/Ingreso registrado.");
        setOpen(false);
        fetchData();
      } else {
        toast.error("Error al guardar.");
      }
    } catch (e) {
      toast.error("Error crítico.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const result = await deletePettyCashMovement(id);
    if (result.success) {
      toast.success("Registro eliminado.");
      fetchData();
    } else {
      toast.error("Error al eliminar.");
    }
  };

  const totalIncome = movements.filter(m => m.type === 'INCOME').reduce((acc, m) => acc + Number(m.amount), 0);
  const totalExpense = movements.filter(m => m.type === 'EXPENSE').reduce((acc, m) => acc + Number(m.amount), 0);
  const balance = totalIncome - totalExpense;

  const filteredMovements = movements.filter(m => 
    m.description.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    (m.linkedCustomerName && m.linkedCustomerName.toLowerCase().includes(search.toLowerCase())) ||
    (m.customerName && m.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-zinc-900 uppercase">Caja Chica</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Control de Flujos Menores • Gestión Administrativa</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-zinc-900 text-white font-bold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-none transition-all whitespace-nowrap">
              <PlusCircle size={16} className="mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-100 bg-white shadow-none  sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="px-7 py-5 bg-zinc-50 border-b border-zinc-100 space-y-0 text-left">
              <DialogTitle className="text-lg font-medium tracking-tight uppercase text-zinc-900">
                {formData.id ? "Editar Registro" : "Registrar Flujo"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-[9px] mt-1 font-bold uppercase tracking-widest">
                Categorización y control de caja
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-7 grid gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar px-7">
              <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="ghost"
                    className={`h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-zinc-900 text-white border-none' : 'bg-white text-zinc-400 border border-zinc-200'}`}
                    onClick={() => setFormData({...formData, type: 'INCOME', category: 'AMORTIZACION'})}
                  >
                    <ArrowUpCircle size={16} className={`mr-2 ${formData.type === 'INCOME' ? 'text-white' : 'text-zinc-400'}`} /> Ingreso
                  </Button>
                  <Button 
                    variant="ghost"
                    className={`h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-zinc-900 text-white border-none' : 'bg-white text-zinc-400 border border-zinc-200'}`}
                    onClick={() => setFormData({...formData, type: 'EXPENSE', category: 'VARIOS'})}
                  >
                    <ArrowDownCircle size={16} className={`mr-2 ${formData.type === 'EXPENSE' ? 'text-white' : 'text-zinc-400'}`} /> Egreso
                  </Button>
              </div>

              {/* Sección de Cliente (Pagador) - Solo para Ingresos */}
              {formData.type === 'INCOME' && (
                <div className="space-y-2.5 pt-1">
                   <div className="flex items-center justify-between">
                     <Label className="text-[9px] font-semibold text-zinc-900 uppercase tracking-widest">Identificar Pagador (Opcional)</Label>
                     {foundCustomer && (
                       <Button variant="ghost" onClick={() => { setFoundCustomer(null); setFormData({...formData, customerId: "", customerName: ""}); }} className="h-5 text-[8px] font-bold uppercase text-red-500 p-0">Limpiar</Button>
                     )}
                   </div>
                   
                   {!foundCustomer ? (
                     <div className="flex items-center border border-zinc-100 rounded-xl overflow-hidden h-10 bg-zinc-50/10 focus-within:border-zinc-400 transition-all shadow-none">
                        <Select value={docSearch.type} onValueChange={v => setDocSearch({ type: v, number: '' })}>
                          <SelectTrigger className="w-20 border-none rounded-none font-medium text-xs focus:ring-0 uppercase h-full bg-zinc-50/10 border-r border-zinc-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dni" className="text-[10px] font-bold uppercase">DNI</SelectItem>
                            <SelectItem value="ruc" className="text-[10px] font-bold uppercase">RUC</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          value={docSearch.number}
                          onChange={e => setDocSearch({...docSearch, number: e.target.value})}
                          onKeyDown={e => e.key === 'Enter' && handleSearchCustomer()}
                          placeholder="INTRODUCIR DOCUMENTO..."
                          className="border-none bg-transparent h-full text-[10px] md:text-[10px] font-medium tracking-tight focus-visible:ring-0 flex-1 px-4"
                        />
                        <Button 
                          onClick={handleSearchCustomer} 
                          disabled={searchingCustomer}
                          className="bg-zinc-900 border-none h-full w-12 rounded-none bg-zinc-900"
                        >
                          {searchingCustomer ? <Loader2 size={14} className="animate-spin" /> : <Search size={16} className="text-white" />}
                        </Button>
                     </div>
                   ) : (
                     <div className="p-3 bg-emerald-50 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in zoom-in duration-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                           <CheckCircle2 size={16} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">{foundCustomer.name}</span>
                           <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Cliente Vinculado</span>
                        </div>
                     </div>
                   )}

                   {/* Listado de Servicios del Cliente */}
                   {customerSubscriptions.length > 0 && (
                     <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                        <Label className="text-[10px] md:text-[10px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Proyecto Vinculado</Label>
                        <Select 
                          value={formData.subscriptionId} 
                          onValueChange={(val) => {
                             const sub = customerSubscriptions.find(s => s.id === val);
                             const balance = sub ? Math.max(0, parseFloat(sub.price) - parseFloat(sub.paidAmount)) : 0;
                             setFormData({
                               ...formData, 
                               subscriptionId: val, 
                               amount: balance > 0 ? balance.toString() : formData.amount,
                               description: `AMORTIZACIÓN - ${sub?.productName || sub?.serviceName}`.toUpperCase()
                             });
                           }}
                        >
                           <SelectTrigger className="h-10 border-zinc-100 bg-zinc-50/10 focus:ring-zinc-900 rounded-xl font-bold text-[10px] md:text-[10px] uppercase w-full">
                              <SelectValue placeholder="LISTA DE PROYECTOS VINCULADOS" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-zinc-100 bg-white shadow-none ">
                              {customerSubscriptions.map(sub => {
                                 const balance = Math.max(0, parseFloat(sub.price) - parseFloat(sub.paidAmount));
                                 return (
                                   <SelectItem key={sub.id} value={sub.id} className="text-[10px] md:text-[10px] font-bold py-2.5 uppercase tracking-wide">
                                      {sub.productName || sub.serviceName} (SALDO: S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })})
                                   </SelectItem>
                                 );
                              })}
                           </SelectContent>
                        </Select>
                     </div>
                   )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Descripción del Concepto</Label>
                <Input 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="AMORTIZACIÓN DE DEUDA / SERVICIOS..."
                  className="h-10 border-zinc-100 bg-zinc-50/10 focus-visible:ring-zinc-900 rounded-xl font-medium text-[10px] md:text-[10px] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Monto (S/)</Label>
                    <Input 
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="0.00"
                      className="h-10 border-zinc-100 bg-zinc-50/10 focus-visible:ring-zinc-900 rounded-xl font-medium text-base placeholder:text-zinc-300"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Categoría</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                       <SelectTrigger className="h-10 border-zinc-100 bg-zinc-50/10 focus:ring-zinc-900 rounded-xl font-medium text-xs uppercase">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                          {categories.map(c => (
                            <SelectItem key={c.value} value={c.value} className="text-[10px] font-bold py-2 uppercase tracking-wide">
                              <div className="flex items-center gap-2">
                                {c.icon} {c.label}
                              </div>
                            </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-1.5 px-0.5">
                 <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Fecha de Operación</Label>
                 <Input 
                   type="date"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                   className="h-10 border-zinc-100 bg-zinc-50/10 focus-visible:ring-zinc-900 rounded-xl font-bold text-sm"
                 />
              </div>
            </div>

            <DialogFooter className="px-7 py-4 bg-zinc-50 border-t border-zinc-100 gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Descartar</Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-zinc-900 text-white h-10 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-none shadow-zinc-200"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : (formData.id ? "Actualizar Registro" : "Guardar Registro")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* METRICAS DASHBOARD SMALL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
         <Card className="border-none shadow-none bg-zinc-900 text-white rounded-2xl overflow-hidden relative group">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Wallet size={120} />
            </div>
            <CardContent className="p-6">
               <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Balance en Caja (S/)</p>
               <h3 className="text-3xl font-medium tracking-tighter mt-2">S/ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
               <div className="mt-4 flex items-center gap-2">
                  <Badge className={`bg-zinc-50/10/10 hover:bg-zinc-50/10/20 border-none text-white text-[8px] px-2 py-0.5 font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {balance >= 0 ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                    {balance >= 0 ? 'Flujo Positivo' : 'Déficit en Caja'}
                  </Badge>
               </div>
            </CardContent>
         </Card>

         <Card className="border-zinc-100 bg-zinc-50/10 shadow-none rounded-2xl relative overflow-hidden group">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Total Ingresos</p>
                    <h3 className="text-2xl font-semibold text-emerald-600 tracking-tight mt-1">S/ {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                     <ArrowUpCircle size={20} />
                  </div>
               </div>
               <p className="text-[8px] font-semibold text-zinc-400 uppercase mt-4 tracking-widest">Fondos No-Contractuales</p>
            </CardContent>
         </Card>

         <Card className="border-zinc-100 bg-zinc-50/10 shadow-none rounded-2xl relative overflow-hidden group">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Total Egresos</p>
                    <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-1">S/ {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-xl text-zinc-900 border border-zinc-100">
                     <ArrowDownCircle size={20} />
                  </div>
               </div>
               <p className="text-[8px] font-semibold text-zinc-400 uppercase mt-4 tracking-widest">Gastos Operativos Varios</p>
            </CardContent>
         </Card>
      </div>

      <Card className="border-zinc-100 bg-white overflow-hidden rounded-2xl border-zinc-100 shadow-none">
         <CardHeader className="p-5 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
             <div className="relative w-full max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
                <Input 
                  placeholder="Búsqueda dinámica..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-10 border-zinc-200 bg-zinc-50/10 text-xs font-semibold tracking-tight rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all"
                />
             </div>
            <div className="flex gap-2">
               <Button variant="outline" className="h-10 border-zinc-200 text-zinc-600 rounded-xl text-xs font-medium px-4">
                  <Filter size={14} className="mr-2" /> Filtros
               </Button>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <Table className="border-t border-zinc-100">
               <TableHeader className="bg-white shadow-none ">
                  <TableRow className="border-zinc-100">
                     <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-7 text-zinc-400">Fecha</TableHead>
                     <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Concepto / Categoría</TableHead>
                     <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Entidad / Pagador</TableHead>
                     <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center text-zinc-400">Monto (S/)</TableHead>
                     <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-center text-zinc-400">Tipo</TableHead>
                     <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-7 text-zinc-400">Opciones</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {loading ? (
                    <TableRow>
                       <TableCell colSpan={6} className="h-32 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
                          Sincronizando flujos de caja...
                       </TableCell>
                    </TableRow>
                  ) : paginatedMovements.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                             <AlertCircle size={32} className="text-zinc-100" strokeWidth={1.5} />
                             <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Sin movimientos registrados</p>
                          </div>
                       </TableCell>
                    </TableRow>
                  ) : paginatedMovements.map(m => (
                    <TableRow key={m.id} className="border-zinc-100  uppercase">
                       <TableCell className="py-4 pl-7 text-zinc-500 whitespace-nowrap">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-semibold text-zinc-900 tracking-tight">{new Date(m.date).toLocaleDateString('es-PE')}</span>
                             <span className="text-[9px] font-medium opacity-60">{new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <div className="flex flex-col leading-tight min-w-[150px]">
                             <span className="text-xs font-semibold text-zinc-800 truncate">{m.description}</span>
                             <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-1.5 ">
                                   <span className="text-[9px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md">{m.category}</span>
                                   {m.linkedSubscriptionName && (
                                     <span className="text-[8px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                        {m.linkedSubscriptionName}
                                     </span>
                                   )}
                                </div>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="h-7 w-7 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                                <User size={12} />
                             </div>
                             <span className="text-[10px] font-semibold text-zinc-600 tracking-tight uppercase">
                                {m.linkedCustomerName || m.customerName || "OPERACIÓN GENERAL"}
                             </span>
                          </div>
                       </TableCell>
                       <TableCell className="text-center">
                          <span className={`text-sm font-medium tracking-tighter ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-zinc-950'}`}>
                             {m.type === 'INCOME' ? '+' : '-'} S/ {Number(m.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                       </TableCell>
                       <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[8px] font-bold px-2 py-0.5 rounded-lg border-none ${m.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                             {m.type === 'INCOME' ? 'INGRESO' : 'EGRESO'}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right pr-7">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border-none ring-0">
                                   <MoreHorizontal size={14} />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-none border-zinc-100">
                                <DropdownMenuItem onClick={() => handleEdit(m)} className="text-xs font-bold gap-2.5 rounded-lg px-2 py-2 cursor-pointer">
                                   <Pencil size={14} className="text-zinc-400" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(m.id)} className="text-xs font-bold gap-2.5 rounded-lg px-2 py-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50">
                                   <Trash2 size={14} /> Eliminar
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
            <div className="p-4 border-t border-zinc-100">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
         </CardContent>
      </Card>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
        tr:hover {
          background-color: transparent !important;
        }
        tr[data-state="selected"]:hover {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
