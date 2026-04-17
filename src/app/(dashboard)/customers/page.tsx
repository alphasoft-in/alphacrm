"use client"

import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Loader2,
  Edit, 
  Trash2, 
  Eye,
  Filter,
  UserCheck
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { queryDocument, saveCustomer, getCustomers, updateCustomer, deactivateCustomer } from "@/lib/actions";
import { toast } from "sonner";

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

export default function CustomersPage() {
  const [isQuerying, setIsQuerying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<"dni" | "ruc" | "ce" | "pasaporte">("dni");
  const [docNumber, setDocNumber] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    address: "",
    status: "",
    condition: "",
    district: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setDbCustomers(data || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!docNumber) return;
    if (docType === "ce" || docType === "pasaporte") {
      toast.error("Consulta de este documento no disponible via API");
      return;
    }

    setIsQuerying(true);
    try {
      const result = await queryDocument(docType as "dni" | "ruc", docNumber);

      if (result.success && result.data) {
        const data = result.data;
        if (docType === "dni") {
          const name = data.nombre_completo || data.nombreCompleto || 
                      (data.nombres ? `${data.nombres} ${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim() : "");
          
          if (name) {
            setCustomerData({
              ...customerData,
              name,
              address: data.direccion || data.direccion_completa || "",
              district: data.distrito || "",
              status: "ACTIVO",
              condition: "HABIDO"
            });
            toast.success("Datos de persona cargados");
          } else {
            toast.error("No se pudo extraer el nombre de la respuesta");
          }
        } else if (docType === "ruc") {
          const name = data.nombre_o_razon_social || data.razon_social || data.razonSocial || data.nombre_comercial || data.nombreComercial;
          
          if (name) {
            setCustomerData({
              ...customerData,
              name,
              address: data.direccion || data.direccion_completa || "",
              district: data.distrito || data.provincia ? `${data.distrito || ""}, ${data.provincia || ""}` : "",
              status: data.estado || "",
              condition: data.condicion || ""
            });
            toast.success("Datos de empresa cargados");
          } else {
            toast.error("No se pudo extraer la razón social de la respuesta");
          }
        }
      } else {
        toast.error(result.error || "No se encontraron resultados");
      }
    } catch (error) {
      toast.error("Error al realizar la consulta");
    } finally {
      setIsQuerying(false);
    }
  };


  const handleSaveCustomer = async () => {
    if (!customerData.name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    
    setIsSaving(true);
    try {
      let result;
      if (isEditing && editingId) {
        result = await updateCustomer(editingId, {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          company: customerData.name,
          address: customerData.address,
          district: customerData.district,
          docType: docType as any,
          docNumber: docNumber,
          position: customerData.position,
          status: customerData.status || "ACTIVE",
          condition: customerData.condition
        });
      } else {
        result = await saveCustomer({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          company: customerData.name,
          address: customerData.address,
          district: customerData.district,
          docType: docType as any,
          docNumber: docNumber,
          position: customerData.position,
          status: customerData.status || "ACTIVE",
          condition: customerData.condition
        });
      }

      if (result.success) {
        toast.success(isEditing ? "Cliente actualizado" : "Cliente registrado");
        setOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setDocNumber("");
        setCustomerData({
           name: "", email: "", phone: "", position: "", address: "", status: "", condition: "", district: ""
        });
        fetchCustomers();
      } else {
        toast.error(result.error || "Error al procesar solicitud");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = (customer: any) => {
    setIsEditing(true);
    setEditingId(customer.id);
    setDocType(customer.docType || "dni");
    setDocNumber(customer.docNumber || "");
    setCustomerData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      position: customer.position || "",
      address: customer.address || "",
      status: customer.status || "",
      condition: customer.condition || "",
      district: customer.district || ""
    });
    setOpen(true);
  };

  const onDeactivate = async (id: string) => {
     if (!confirm("¿Deseas inactivar este cliente?")) return;
     try {
        const result = await deactivateCustomer(id);
        if (result.success) {
           toast.success("Estado actualizado");
           fetchCustomers();
        } else {
           toast.error(result.error);
        }
     } catch (error) {
        toast.error("Error al inactivar");
     }
  };

   const filteredCustomers = dbCustomers.filter(customer => 
     customer.name.toLowerCase().includes(search.toLowerCase()) ||
     customer.docNumber?.toLowerCase().includes(search.toLowerCase()) ||
     customer.email?.toLowerCase().includes(search.toLowerCase())
   );

   const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
   const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

   useEffect(() => {
     setCurrentPage(1);
   }, [search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-l-[3px] border-zinc-900 pl-4 py-0.5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase">Gestión de Clientes</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Directorio Centralizado • Base de Entidades</p>
        </div>
        
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setIsEditing(false);
            setEditingId(null);
            setDocNumber("");
            setCustomerData({
              name: "", email: "", phone: "", position: "", address: "", status: "", condition: "", district: ""
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-6 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setDocNumber("");
                setCustomerData({
                  name: "", email: "", phone: "", position: "", address: "", status: "", condition: "", district: ""
                });
              }}
            >
              <Plus size={16} className="mr-2" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-200 bg-white text-zinc-950 shadow-2xl sm:max-w-[700px] p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0 text-left">
              <div className="flex flex-col">
                <DialogTitle className="text-lg text-zinc-950 font-semibold tracking-tight uppercase">
                  {isEditing ? "Editar Cliente" : "Registro de Cliente"}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-[9px] mt-1 font-semibold uppercase tracking-widest">
                  Parámetros de identificación y contacto
                </DialogDescription>
              </div>
              {isEditing && (
                <Badge variant="outline" className={customerData.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100 h-6 px-3" : "bg-zinc-100 text-zinc-500 border-zinc-200 h-6 px-3"}>
                  {customerData.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
              )}
            </DialogHeader>
            
            <div className="p-8 grid gap-6">
              {/* Identificación */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Documento</Label>
                  <Select value={docType} onValueChange={(val: any) => {
                    setDocType(val);
                    setDocNumber("");
                  }}>
                    <SelectTrigger className="border-zinc-200 h-10 text-xs font-semibold uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni" className="text-xs uppercase font-semibold">DNI</SelectItem>
                      <SelectItem value="ruc" className="text-xs uppercase font-semibold">RUC</SelectItem>
                      <SelectItem value="ce" className="text-xs uppercase font-semibold">Carnet de Extranjería</SelectItem>
                      <SelectItem value="pasaporte" className="text-xs uppercase font-semibold">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Número</Label>
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:border-zinc-400 transition-all">
                    <Input 
                      value={docNumber || ""}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="border-none h-10 pl-3 flex-1 text-sm font-semibold tracking-tight focus-visible:ring-0 shadow-none" 
                      placeholder="..."
                    />
                    <Button 
                      type="button"
                      onClick={handleQuery}
                      disabled={isQuerying}
                      className="bg-zinc-900 border-none h-10 w-12 rounded-none hover:bg-black transition-colors"
                    >
                      {isQuerying ? <Loader2 size={12} className="animate-spin" /> : <Search size={14} />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* General */}
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Razón Social / Nombre</Label>
                  <Input 
                    value={customerData.name || ""}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    className="border-zinc-100 h-10 text-sm font-semibold bg-zinc-50/30" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">WhatsApp</Label>
                    <Input 
                      value={customerData.phone || ""}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      className="border-zinc-100 h-10 text-sm font-semibold bg-zinc-50/30" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Email</Label>
                    <Input 
                      value={customerData.email || ""}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      className="border-zinc-100 h-10 text-sm font-semibold bg-zinc-50/30" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100 mt-2">
               <Button 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="text-zinc-500 font-semibold h-10 px-6 text-xs uppercase"
               >
                Cancelar
               </Button>
                <Button 
                  onClick={handleSaveCustomer}
                  disabled={isSaving}
                  className="bg-zinc-900 hover:bg-black text-white font-semibold h-10 px-8 rounded-xl text-xs uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? "Actualizar" : "Registrar")}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
             <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
                <Input 
                  placeholder="Búsqueda dinámica..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-10 border-zinc-200 bg-zinc-50/50 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-zinc-900 transition-all rounded-xl"
                />
             </div>
             <Button variant="outline" className="h-10 border-zinc-200 text-zinc-500 font-semibold px-4 gap-2">
                <Filter size={14} /> Filtros
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Entidad</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Contacto</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Ubicación</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest">Estado</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest pr-6">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-zinc-400 font-semibold text-xs animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sincronizando Directorio...
                    </div>
                  </TableCell>
                </TableRow>
              ) : dbCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[11px] font-semibold text-zinc-300 tracking-tight">
                    No se encontraron Clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-900 leading-tight min-w-0 flex-1">{customer.name}</span>
                        <span className="text-[9px] font-medium text-zinc-400 uppercase mt-1">ID: {customer.docNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-zinc-500 group">
                            <Mail size={12} className="text-zinc-300" />
                            <span className="text-[10px] font-medium truncate max-w-[150px]">{customer.email || "-"}</span>
                         </div>
                         <div className="flex items-center gap-2 text-zinc-500">
                            <Phone size={12} className="text-zinc-300" />
                            <span className="text-[10px] font-medium">{customer.phone || "-"}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-medium text-zinc-500 uppercase">{customer.district || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${customer.status === "ACTIVE" ? "bg-emerald-500" : "bg-zinc-300"}`} />
                        <span className="text-[10px] font-semibold text-zinc-600">
                          {customer.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900 border-none ring-0">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl">
                          <DropdownMenuLabel className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 px-2 py-1.5">Control</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer"
                            onClick={() => { setSelectedCustomer(customer); setIsViewOpen(true); }}
                          >
                             <Eye size={14} className="text-zinc-400" /> Perfil Detallado
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer" onClick={() => onEdit(customer)}>
                             <Edit size={14} className="text-zinc-400" /> Editar Registro
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-50 my-1" />
                          <DropdownMenuItem className="text-xs font-semibold gap-2.5 rounded-lg px-2 py-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50" onClick={() => onDeactivate(customer.id)}>
                             <Trash2 size={14} /> Inactivar
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

      {/* Perfil Detallado Platinum */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[750px] p-0 border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-2xl">
          <DialogHeader className="px-8 py-7 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center gap-5 space-y-0 text-left">
            <div className="h-14 w-14 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-black/10">
              {selectedCustomer?.name?.charAt(0)}
            </div>
            <div className="flex flex-col flex-1">
              <DialogTitle className="text-xl font-semibold tracking-tight uppercase text-zinc-950 leading-none">
                {selectedCustomer?.name}
              </DialogTitle>
              <div className="flex items-center gap-2.5 mt-2.5">
                 <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                   {selectedCustomer?.docType}: {selectedCustomer?.docNumber}
                 </span>
                 <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full" />
                 <Badge variant="outline" className="bg-zinc-900 text-white border-none text-[8px] font-bold h-4 px-2 tracking-widest uppercase">
                   {selectedCustomer?.status}
                 </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="p-10 grid grid-cols-2 gap-12 bg-white uppercase">
            <div className="space-y-8">
               <div className="space-y-3">
                  <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Contacto Directo</p>
                  <div className="space-y-3 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                     <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-600">
                        <Mail size={14} className="text-zinc-300" /> {selectedCustomer?.email || "-"}
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-600">
                        <Phone size={14} className="text-zinc-300" /> {selectedCustomer?.phone || "-"}
                     </div>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Cargo Operativo</p>
                  <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{selectedCustomer?.position || "NO ASIGNADO"}</p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="space-y-3">
                  <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Geolocalización</p>
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                      <p className="text-[10px] font-bold text-zinc-900 leading-relaxed">{selectedCustomer?.address || "-"}</p>
                      <p className="text-[9px] font-semibold text-zinc-400 uppercase mt-2 tracking-widest">{selectedCustomer?.district || "-"}</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Facturación</p>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight leading-tight">{selectedCustomer?.company || "MISMA ENTIDAD"}</p>
               </div>
            </div>
          </div>
          
          <DialogFooter className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100">
             <Button 
              variant="outline" 
              onClick={() => setIsViewOpen(false)} 
              className="h-10 px-10 text-[10px] font-bold uppercase tracking-widest border-zinc-200 bg-white rounded-xl shadow-sm hover:bg-zinc-50"
             >
                Cerrar Expediente
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
