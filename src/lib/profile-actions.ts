'use server'

import { z } from 'zod'
import { neon } from '@neondatabase/serverless'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { scryptSync } from 'crypto'

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
})

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session?.userId) return { message: 'No autorizado' }

  const result = profileSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = result.data
  const dbUrl = process.env.DATABASE_URL!
  const sql = neon(dbUrl)

  try {
    if (password) {
      const salt = randomBytes(16).toString('hex')
      const hashedPassword = scryptSync(password, salt, 64).toString('hex')
      const finalPassword = `${salt}:${hashedPassword}`
      
      await sql`
        UPDATE "User" 
        SET name = ${name}, email = ${email}, password = ${finalPassword}, "updatedAt" = NOW() 
        WHERE id = ${session.userId}
      `
    } else {
      await sql`
        UPDATE "User" 
        SET name = ${name}, email = ${email}, "updatedAt" = NOW() 
        WHERE id = ${session.userId}
      `
    }

    revalidatePath('/')
    return { success: true, message: 'Perfil actualizado con éxito' }
  } catch (error: any) {
    if (error.code === '23505') {
      return { message: 'El correo electrónico ya está en uso' }
    }
    return { message: 'Error al actualizar el perfil' }
  }
}

// Helper needed because crypto.randomBytes is not available in all environments, 
// using generic random generation if needed, but scryptSync is already used in auth-actions.
import { randomBytes } from 'crypto'
