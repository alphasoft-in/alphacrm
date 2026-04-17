"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Package,
  Layers,
  Clock,
  ShieldCheck,
  Eye, 
  Edit, 
  Trash2,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Filter, Zap, LayoutGrid, CheckCircle2, History } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
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
import { getServices, saveService, updateService, deleteService } from "@/lib/actions";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    billingCycle: "MONTHLY",
    taxStatus: "INC_IGV"
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await getServices();
    setServices(data);
    setLoading(false);
  };

  const handleOpenNew = () => {
    setFormData({ name: "", description: "", basePrice: "", billingCycle: "MONTHLY", taxStatus: "INC_IGV" });
    setIsEditing(false);
    setEditingId(null);
    setOpen(true);
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      basePrice: service.basePrice.toString(),
      billingCycle: service.billingCycle,
      taxStatus: service.taxStatus || "INC_IGV"
    });
    setIsEditing(true);
    setEditingId(service.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.basePrice) {
      toast.error("Nombre y precio son requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        billingCycle: formData.billingCycle,
        taxStatus: formData.taxStatus
      };

      let result;
      if (isEditing && editingId) {
        result = await updateService(editingId, payload);
      } else {
        result = await saveService(payload);
      }

      if (result.success) {
        toast.success(isEditing ? "Servicio actualizado" : "Servicio registrado");
        setOpen(false);
        fetchServices();
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este servicio?")) {
      const result = await deleteService(id);
      if (result.success) {
        toast.success("Servicio eliminado");
        fetchServices();
      } else {
        toast.error(result.error);
      }
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getCycleText = (cycle: string) => {
    switch (cycle) {
      case "MONTHLY": return "Mensual";
      case "QUARTERLY": return "Trimestral";
      case "SEMI_ANNUAL": return "Semestral";
      case "ANNUAL": return "Anual";
      default: return cycle;
    }
  };

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Cálculos para los Cards
  const totalServices = services.length;
  const availableServices = services.length; // Por ahora todos son disponibles
  const availabilityRate = totalServices > 0 ? (availableServices / totalServices) * 100 : 100;
  
  const lastUpdate = services.length > 0 
    ? new Date(Math.max(...services.map(s => new Date(s.updatedAt || s.createdAt).getTime())))
    : new Date();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Catálogo de Servicios</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Estructura Comercial • Gestión de Productos</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              <Plus size={16} className="mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent 
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[600px] p-0 overflow-hidden rounded-2xl"
          >
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl text-zinc-900">
                {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                {isEditing ? "Modifica los parámetros del servicio." : "Agrega un nuevo producto o servicio a tu portafolio."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 p-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-700 font-semibold">Nombre del Servicio</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Soporte Técnico 24/7" 
                  className="border-zinc-200 bg-zinc-50/20 h-10" 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-zinc-700 font-semibold">Descripción (Opcional)</Label>
                <Input 
                  id="description" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Pequeña reseña del servicio..." 
                  className="border-zinc-200 bg-zinc-50/20 h-10" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-zinc-700 font-semibold">Precio Base (S/.)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={formData.basePrice}
                    onChange={e => setFormData({...formData, basePrice: e.target.value})}
                    placeholder="0.00" 
                    className="border-zinc-200 bg-zinc-50/20 h-10" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cycle" className="text-zinc-700 font-semibold">Ciclo de Facturación</Label>
                  <Select value={formData.billingCycle} onValueChange={v => setFormData({...formData, billingCycle: v})}>
                    <SelectTrigger className="border-zinc-200 bg-zinc-50/20 text-zinc-900 h-10 font-medium">
                      <SelectValue placeholder="Ciclo" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-200 bg-white text-zinc-900">
                      <SelectItem value="MONTHLY">Mensual</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                      <SelectItem value="SEMI_ANNUAL">Semestral</SelectItem>
                      <SelectItem value="ANNUAL">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tax" className="text-zinc-700 font-semibold text-xs uppercase tracking-widest">Estatus de Impuesto (IGV)</Label>
                <Select value={formData.taxStatus} onValueChange={v => setFormData({...formData, taxStatus: v})}>
                  <SelectTrigger className="border-zinc-200 bg-zinc-50/20 text-zinc-900 h-10 font-medium">
                    <SelectValue placeholder="Impuesto" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-200 bg-white text-zinc-900 font-semibold text-xs">
                    <SelectItem value="INC_IGV">Precio incluye IGV</SelectItem>
                    <SelectItem value="PLUS_IGV">+ 18% IGV Adicional</SelectItem>
                    <SelectItem value="NO_IGV">Exonerado / Sin IGV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-200 hover:bg-zinc-100">
                Cancelar
              </Button>
              <Button disabled={isSaving} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                {isSaving ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Publicar Nuevo Servicio")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border-zinc-200 bg-white shadow-sm rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <LayoutGrid className="w-16 h-16 text-zinc-900" />
            </div>
            <CardHeader className="pb-2 pt-4 px-5">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Capacidad Total</span>
               </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="text-3xl font-bold text-zinc-900 tracking-tighter">{totalServices}</div>
               <p className="text-[9px] text-zinc-400 font-semibold uppercase mt-1">Servicios activos en portafolio</p>
            </CardContent>
         </Card>

         <Card className="border-zinc-200 bg-white shadow-sm rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 className="w-16 h-16 text-zinc-900" />
            </div>
            <CardHeader className="pb-2 pt-4 px-5">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Disponibilidad</span>
               </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="text-3xl font-bold text-zinc-900 tracking-tighter">{availabilityRate}%</div>
               <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1 tracking-tight">SLA OPERATIVO ÓPTIMO</p>
            </CardContent>
         </Card>

         <Card className="border-zinc-200 bg-zinc-900 shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <History className="w-16 h-16 text-white" />
            </div>
            <CardHeader className="pb-2 pt-4 px-5">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sincronización</span>
               </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="text-2xl font-bold text-white tracking-tighter uppercase">
                 {lastUpdate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
               </div>
               <p className="text-[9px] text-zinc-400 font-semibold uppercase mt-1 tracking-widest">Última actualización de catálogo</p>
            </CardContent>
         </Card>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl mt-2">
        <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 gap-4">
          <div className="relative group flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
             <Input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Buscar servicios por nombre o descripción..." 
               className="pl-9 h-10 border-zinc-200 bg-zinc-50/50 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all rounded-xl"
             />
          </div>
          <Button variant="outline" className="h-10 border-zinc-200 text-zinc-600 rounded-xl text-xs font-medium px-4">
             <Filter size={14} className="mr-2" /> Filtros
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader className="bg-zinc-50/50 rounded-t-lg">
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6 text-zinc-500">Servicio</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Precio Base</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Facturación</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Estado</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6 text-zinc-500">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="text-xs text-zinc-500">Cargando catálogo...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                    No se encontraron servicios.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-zinc-50 text-zinc-400">
                           <Package size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{service.name}</span>
                          <span className="text-[8px] text-zinc-400 font-medium uppercase tracking-widest mt-0.5">{service.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-zinc-900">
                      <div className="flex flex-col">
                        <span className="text-[11px]">S/ {service.basePrice.toFixed(2)}</span>
                        <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                          {service.taxStatus === 'INC_IGV' ? 'Inc. IGV' : service.taxStatus === 'PLUS_IGV' ? '+ IGV' : 'Sin IGV'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-tight">{getCycleText(service.billingCycle)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-100 bg-white text-zinc-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                        Disponible
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 h-8 w-8 rounded-lg transition-all">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Gestión de Servicio</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedService(service); setViewOpen(true); }} className="gap-2 cursor-pointer">
                             <Eye size={14} className="text-zinc-400" />
                             Detalles técnicos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2 cursor-pointer">
                             <Edit size={14} className="text-zinc-400" />
                             Editar servicio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(service.id)} className="gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer">
                             <Trash2 size={14} />
                             Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* MODAL DE SOLO LECTURA: DETALLES TÉCNICOS */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-zinc-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Package size={20} />
              </div>
              Ficha Técnica del Servicio
            </DialogTitle>
            <DialogDescription>
              Especificaciones y parámetros registrados en el catálogo.
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-start gap-4 border-b border-zinc-100 pb-3">
                <Label className="text-right font-bold text-zinc-500 uppercase text-[10px] tracking-widest mt-1">Servicio:</Label>
                <div className="col-span-3 text-zinc-900 font-semibold">{selectedService.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b border-zinc-100 pb-3">
                <Label className="text-right font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Precio Base:</Label>
                <div className="col-span-3 flex items-center gap-3">
                   <div className="text-emerald-600 font-bold text-lg">S/ {selectedService.basePrice.toFixed(2)}</div>
                   <Badge variant="secondary" className="text-[9px] uppercase tracking-widest bg-zinc-100 text-zinc-600">
                      {selectedService.taxStatus === 'INC_IGV' ? 'IGV Incluido' : selectedService.taxStatus === 'PLUS_IGV' ? '+ 18% IGV' : 'Sin IGV'}
                   </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b border-zinc-100 pb-3">
                <Label className="text-right font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Facturación:</Label>
                <div className="col-span-3 text-zinc-700 font-medium">
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    {getCycleText(selectedService.billingCycle)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-bold text-zinc-500 uppercase text-[10px] tracking-widest mt-1">Descripción:</Label>
                <div className="col-span-3 text-sm text-zinc-600 leading-relaxed italic">
                  {selectedService.description || "Sin descripción técnica adicional registrada."}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="border-t border-zinc-100 pt-6">
            <Button onClick={() => setViewOpen(false)} className="bg-zinc-900 hover:bg-zinc-800 text-white w-full">
              Cerrar Ficha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
