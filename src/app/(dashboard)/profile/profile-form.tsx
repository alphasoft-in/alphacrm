'use client'

import { useActionState, useEffect } from 'react'
import { updateProfile } from '@/lib/profile-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Lock, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormProps {
  initialData: {
    name: string | null
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Card className="border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="pt-6">
        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">
              Nombre Completo
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <Input
                id="name"
                name="name"
                defaultValue={initialData.name || ''}
                placeholder="Tu nombre"
                className="pl-10 h-11 bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all rounded-xl text-sm"
              />
            </div>
            {state?.errors?.name && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{state.errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">
              Correo Electrónico
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData.email}
                placeholder="tu@correo.com"
                className="pl-10 h-11 bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all rounded-xl text-sm"
              />
            </div>
            {state?.errors?.email && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{state.errors.email}</p>
            )}
          </div>

          <div className="pt-2">
            <div className="h-px bg-zinc-100 w-full mb-5" />
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5">
                Nueva Contraseña <span className="text-[8px] font-medium">(Opcional)</span>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
                  className="pl-10 h-11 bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all rounded-xl text-sm"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-[10px] text-red-500 font-bold ml-1">{state.errors.password}</p>
              )}
            </div>
          </div>

          <Button 
            disabled={pending} 
            type="submit" 
            className="w-full h-11 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl mt-4 shadow-lg shadow-zinc-200 transition-all active:scale-[0.98]"
          >
            {pending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Save size={16} /> Guardar Cambios
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
