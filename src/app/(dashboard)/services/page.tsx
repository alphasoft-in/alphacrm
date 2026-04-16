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

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Catálogo de Servicios</h1>
          <p className="text-zinc-500">Define y administra los servicios que ofreces a tus clientes.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm h-9 px-4 font-bold uppercase text-[10px] tracking-wider">
              <Plus size={16} />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[600px] p-0 overflow-hidden rounded-xl">
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border-zinc-200 bg-white shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Layers size={16} /> Total Servicios
                </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-zinc-900">{services.length}</div>
               <p className="text-xs text-zinc-400">Servicios activos en catálogo</p>
            </CardContent>
         </Card>
         <Card className="border-zinc-200 bg-white shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <ShieldCheck size={16} /> Disponibilidad
                </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-xl font-bold text-zinc-900 truncate">SLA 99.9%</div>
               <p className="text-xs text-emerald-600">Servicios operativos</p>
            </CardContent>
         </Card>
         <Card className="border-zinc-200 bg-white shadow-sm border-t-4 border-t-indigo-500">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Clock size={16} /> Última Actualización
                </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-zinc-900">Hoy</div>
               <p className="text-xs text-zinc-400">Catálogo sincronizado</p>
            </CardContent>
         </Card>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-zinc-50">
          <div className="flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <Input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar servicios por nombre o descripción..." 
                  className="pl-10 border-zinc-200 bg-zinc-50/50 outline-none"
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader className="bg-zinc-50/50 rounded-t-lg">
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="text-zinc-500 font-semibold">Servicio</TableHead>
                <TableHead className="text-zinc-500 font-semibold">Precio Base</TableHead>
                <TableHead className="text-zinc-500 font-semibold">Facturación</TableHead>
                <TableHead className="text-zinc-500 font-semibold">Estado</TableHead>
                <TableHead className="text-right text-zinc-500 font-semibold">Acciones</TableHead>
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
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                           <Package size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          <span className="text-[10px] text-zinc-400">{service.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-zinc-900 text-sm">
                      <div className="flex flex-col">
                        <span>S/ {service.basePrice.toFixed(2)}</span>
                        <span className="text-[9px] text-zinc-400 font-medium uppercase">
                          {service.taxStatus === 'INC_IGV' ? 'Inc. IGV' : service.taxStatus === 'PLUS_IGV' ? '+ IGV' : 'Sin IGV'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-500">{getCycleText(service.billingCycle)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
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
