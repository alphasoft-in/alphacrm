"use client"

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractViewProps {
  contract: {
    name: string;
    totalAmount: number;
    downPayment?: number;
    description?: string;
    dealDate: string | Date;
    customerName: string;
    docType: string;
    docNumber: string;
    address?: string;
    district?: string;
    paymentTerms?: string;
    installments?: number;
  };
  onClose: () => void;
}

export function ContractView({ contract, onClose }: ContractViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const today = format(new Date(contract.dealDate), "dd 'de' MMMM 'de' yyyy", { locale: es });

  const getPaymentTermClause = () => {
    const total = contract.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 });
    const downPayment = (contract.downPayment || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    const remaining = (contract.totalAmount - (contract.downPayment || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    
    if (contract.paymentTerms === "INSTALLMENTS") {
      const installmentCount = contract.installments || 1;
      const installmentAmount = ((contract.totalAmount - (contract.downPayment || 0)) / installmentCount).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      
      return `Por el servicio objeto del presente contrato, EL CLIENTE se obliga a pagar a EL PRESTADOR la suma total de S/ ${total} (Soles). La forma de pago será la siguiente: un pago inicial (Monto de Inicial) de S/ ${downPayment} a la firma del presente instrumento, y el saldo restante de S/ ${remaining} será cancelado en ${installmentCount} cuota(s) mensuales de S/ ${installmentAmount} cada una.`;
    } 
    
    if (contract.paymentTerms === "TOTAL") {
      return `Por el servicio objeto del presente contrato, EL CLIENTE se obliga a pagar a EL PRESTADOR la suma total de S/ ${total} (Soles) mediante un único pago anticipado realizado de forma íntegra previo al inicio de la prestación de los servicios.`;
    }

    // Default 50-50
    return `Por el servicio objeto del presente contrato, EL CLIENTE se obliga a pagar a EL PRESTADOR la suma total de S/ ${total} (Soles). La forma de pago será la siguiente: un adelanto (Monto de Inicial) de S/ ${downPayment} a la firma del contrato, y el 50% restante equivalente a S/ ${remaining} a la entrega final del proyecto, previo al despliegue en el entorno de producción.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:relative">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col print:max-h-none print:shadow-none print:rounded-none">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50 print:hidden">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                <Printer size={16} />
             </div>
             <div>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Instrumento Notarial Digital</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Esquema: {contract.paymentTerms === '50-50' ? 'Binario (50/50)' : contract.paymentTerms === 'INSTALLMENTS' ? `${contract.installments} Cuotas` : 'Total Prepago'}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-zinc-900 text-white h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl">
               <Printer size={16} className="mr-2" /> Certificar y Descargar
            </Button>
            <Button variant="ghost" onClick={onClose} className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-900 rounded-xl">
               <X size={20} />
            </Button>
          </div>
        </div>

        {/* Contract Content (The "Paper") */}
        <div className="flex-1 p-12 md:p-20 bg-white text-zinc-900 font-serif leading-relaxed print:p-0 print:m-0 print:text-[12pt]">
           <div className="max-w-[210mm] mx-auto text-justify">
              <header className="text-center mb-12">
                 <h1 className="text-2xl font-bold uppercase mb-2 leading-tight">CONTRATO DE LOCACIÓN DE SERVICIOS TECNOLÓGICOS</h1>
                 <p className="text-[10px] border-t border-b border-zinc-200 py-1.5 inline-block px-12 font-sans font-black italic uppercase tracking-widest">ID-P: {contract.name.toUpperCase().replace(/\s+/g, '-')}</p>
              </header>

              <section className="mb-8">
                 <p className="mb-4">
                    Conste por el presente documento, el **CONTRATO DE LOCACIÓN DE SERVICIOS** que celebran de una parte:
                 </p>
                 <p className="mb-4 pl-6">
                    **EL PRESTADOR:** ALPHA AGENCY S.A.C., con RUC N° 20601234567, con domicilio legal en la ciudad de Lima, debidamente representado por su Gerente General, a quien en adelante se le denominará simplemente como **EL PRESTADOR**.
                 </p>
                 <p className="mb-4">Y de la otra parte:</p>
                 <p className="mb-8 pl-6">
                    **EL CLIENTE:** {contract.customerName.toUpperCase()}, con {contract.docType.toUpperCase()} N° {contract.docNumber}, domiciliado en {contract.address || "Dirección según plataforma RUC/DNI"}, {contract.district || ""}, a quien en adelante se le denominará simplemente como **EL CLIENTE**.
                 </p>
                 <p className="mb-4">
                    Ambas partes declaran ser mayores de edad, estar en pleno ejercicio de sus derechos civiles y acuerdan celebrar el presente contrato bajo los términos y condiciones siguientes:
                 </p>
              </section>

              <section className="space-y-8">
                 <div>
                    <h3 className="font-bold underline uppercase mb-3 text-sm tracking-wide">PRIMERA: OBJETO DEL CONTRATO</h3>
                    <p>
                       EL PRESTADOR se obliga a prestar a EL CLIENTE los servicios especializados de: **{contract.name}**, cuya ejecución y alcance legal comprende: {contract.description || "Gestión y ejecución del proyecto tecnológico detallado en la propuesta comercial previa."}.
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold underline uppercase mb-3 text-sm tracking-wide">SEGUNDA: RETRIBUCIÓN ECONÓMICA Y ACUERDO DE PAGO</h3>
                    <p>
                       {getPaymentTermClause()}
                    </p>
                    <p className="mt-3 italic text-[11px]">
                       * El incumplimiento en el pago de las cuotas pactadas facultará a EL PRESTADOR a la suspensión inmediata de los servicios sin responsabilidad alguna.
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold underline uppercase mb-3 text-sm tracking-wide">TERCERA: OBLIGACIONES Y GARANTÍA</h3>
                    <p>
                       EL PRESTADOR garantiza el correcto funcionamiento del software/servicio entregado bajo los estándares de la industria. EL CLIENTE se compromete a facilitar toda la información necesaria para el cumplimiento de los plazos establecidos.
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold underline uppercase mb-3 text-sm tracking-wide">CUARTA: CONFIDENCIALIDAD Y PROPIEDAD INTELECTUAL</h3>
                    <p>
                       Toda la información intercambiada es de carácter estrictamente confidencial. La propiedad intelectual del código fuente o diseños será transferida a EL CLIENTE una vez se haya liquidado el 100% del monto pactado en la cláusula segunda.
                    </p>
                 </div>
              </section>

              <footer className="mt-20">
                 <p className="text-right mb-16 font-sans text-sm font-bold">
                    Suscrito en la ciudad de Lima, el {today}
                 </p>

                 <div className="grid grid-cols-2 gap-20 mt-32 text-center text-[9px] font-sans font-black tracking-widest leading-loose uppercase">
                    <div className="border-t border-zinc-900 pt-5 px-4 shadow-sm">
                       _________________________________<br/>
                       EL PRESTADOR<br/>
                       ALPHA AGENCY S.A.C.<br/>
                       RUC: 20601234567
                    </div>
                    <div className="border-t border-zinc-900 pt-5 px-4 shadow-sm">
                       _________________________________<br/>
                       EL CLIENTE<br/>
                       {contract.customerName.toUpperCase()}<br/>
                       {contract.docType.toUpperCase()}: {contract.docNumber}
                    </div>
                 </div>
              </footer>
           </div>
        </div>
      </div>
    </div>
  );
}
