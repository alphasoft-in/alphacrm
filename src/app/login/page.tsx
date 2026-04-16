'use client'

import { useActionState } from 'react'
import { login } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-950 selection:bg-zinc-950 selection:text-white font-sans antialiased p-4">
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px]"
      >
        {/* Simplified Header - Light Mode */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-zinc-600" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 m-0">
            Alpha Business
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold mt-1.5 line-clamp-1">
            Gestión de Acceso
          </p>
        </div>

        {/* Compact Login Box - Light Mode */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl shadow-zinc-200/50">
          <div className="mb-6">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Identificación</h2>
          </div>
          
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 block ml-0.5">
                Correo Electrónico
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@alpha.pe"
                  required
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 pl-10 h-10 ring-0 focus:border-zinc-900 focus:bg-white transition-all rounded-lg placeholder:text-zinc-300 text-xs"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-[9px] text-red-600 font-bold ml-0.5">{state.errors.email}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 block ml-0.5">
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 pl-10 h-10 ring-0 focus:border-zinc-900 focus:bg-white transition-all rounded-lg text-xs"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-[9px] text-red-600 font-bold ml-0.5">{state.errors.password}</p>
              )}
            </div>

            <AnimatePresence>
              {state?.message && !state?.errors && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <p className="text-[10px] text-red-600 font-bold text-center uppercase tracking-tight">{state.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              disabled={pending} 
              type="submit" 
              className="w-full h-10 bg-zinc-900 text-white hover:bg-black font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] rounded-lg mt-2 shadow-sm"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Entrar <ArrowRight size={14} />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Minimal Footer - Light Mode */}
        <div className="mt-8 text-center">
           <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-[0.5em]">
             &copy; {new Date().getFullYear()} Alpha Business Group
           </p>
        </div>
      </motion.div>
    </div>
  )
}
