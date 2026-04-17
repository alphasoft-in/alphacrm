"use client"

import { useState, useEffect } from "react";
import { 
  ArrowDownRight, 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Trash2,
  ExternalLink,
  Filter,
  ArrowRight
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getAccountsPayable, saveAccountPayable, payAccountPayable, deleteAccountPayable } from "@/lib/actions";

export default function PayablesPage() {
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    supplier: "",
    amount: "",
    dueDate: new Date().toISOString().split('T')[0],
    category: "SERVICIOS"
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getAccountsPayable();
    setPayables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.supplier || !formData.amount) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    const res = await saveAccountPayable(formData);
    if (res.success) {
      toast.success("Cuenta por pagar registrada");
      setIsDialogOpen(false);
      setFormData({
        description: "",
        supplier: "",
        amount: "",
        dueDate: new Date().toISOString().split('T')[0],
        category: "SERVICIOS"
      });
      fetchData();
    }
  };

  const handlePay = async (id: string) => {
    if (!confirm("¿Confirmas el pago de esta obligación? Se generará un egreso en Caja Chica.")) return;
    const res = await payAccountPayable(id);
    if (res.success) {
      toast.success("Pago procesado y registrado en Caja Chica");
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cuenta por pagar?")) return;
    const res = await deleteAccountPayable(id);
    if (res.success) {
      toast.success("Registro eliminado");
      fetchData();
    }
  };

  const filteredPayables = payables.filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = payables.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const totalOverdue = payables.filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date()).reduce((acc, p) => acc + parseFloat(p.amount), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col gap-6 border-l-[3px] border-zinc-900 pl-4 py-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium tracking-tight text-zinc-900 uppercase">Cuentas por Pagar</h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em] leading-none mt-1">Obligaciones Financieras y Proveedores</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest px-6 h-10 rounded-xl gap-2 shadow-lg shadow-zinc-200">
                <Plus size={14} /> Nueva Obligación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl border-zinc-100 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Registrar Cuenta por Pagar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Descripción / Concepto</Label>
                  <Input 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
                    placeholder="EJ: ALQUILER DE LOCAL MAYO"
                    className="rounded-xl border-zinc-200 text-[11px] font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Proveedor / Beneficiario</Label>
                  <Input 
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value.toUpperCase()})}
                    placeholder="EJ: INVERSIONES LUNA SAC"
                    className="rounded-xl border-zinc-200 text-[11px] font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Monto (S/)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      className="rounded-xl border-zinc-200 text-[11px] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fecha de Vencimiento</Label>
                    <Input 
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="rounded-xl border-zinc-200 text-[11px] font-medium"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest h-12 rounded-xl mt-4">
                  Guardar Obligación
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="BUSCAR PROVEEDOR O CONCEPTO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-4 border border-zinc-200 bg-white text-zinc-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-zinc-900 w-full shadow-none transition-all"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-zinc-100 bg-zinc-50 shadow-none rounded-2xl border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-zinc-900 rounded-lg text-white">
                  <DollarSign size={16} />
               </div>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Pendiente</span>
            </div>
            <h3 className="text-3xl font-medium tracking-tighter text-zinc-900">S/ {totalPending.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 bg-white shadow-none rounded-2xl border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                  <AlertCircle size={16} />
               </div>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Vencido / Crítico</span>
            </div>
            <h3 className="text-3xl font-medium tracking-tighter text-rose-600">S/ {totalOverdue.toLocaleString('en-PE', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-100 shadow-none rounded-2xl overflow-hidden border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-100">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 pl-8 text-zinc-400">Concepto / Proveedor</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center text-zinc-400">Vencimiento</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center text-zinc-400">Monto</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center text-zinc-400">Estado</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right pr-8 text-zinc-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-40 text-center text-[10px] font-bold text-zinc-300 uppercase animate-pulse">Cargando obligaciones...</TableCell></TableRow>
              ) : filteredPayables.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-40 text-center text-[10px] font-bold text-zinc-300 uppercase">No hay cuentas por pagar registradas</TableCell></TableRow>
              ) : filteredPayables.map((p) => {
                const isOverdue = p.status === 'PENDING' && new Date(p.dueDate) < new Date();
                return (
                  <TableRow key={p.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors group">
                    <TableCell className="py-5 pl-8">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{p.description}</span>
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Building2 size={10} /> {p.supplier}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-zinc-900'}`}>{new Date(p.dueDate).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-[7px] font-black bg-rose-600 text-white px-1.5 rounded-full uppercase tracking-tighter">Vencido</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[12px] font-bold text-zinc-950">S/ {parseFloat(p.amount).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${p.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                        {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'PENDING' && (
                          <Button 
                            onClick={() => handlePay(p.id)}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 text-[8px] font-bold uppercase tracking-widest h-8 px-3 rounded-lg flex gap-1"
                          >
                            Pagar
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDelete(p.id)}
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </Button>
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
