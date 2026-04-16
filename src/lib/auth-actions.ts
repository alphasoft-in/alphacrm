'use server'

import { z } from 'zod'
import { neon } from '@neondatabase/serverless'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { scryptSync, timingSafeEqual } from 'crypto'

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }).trim(),
  password: z.string().min(1, { message: 'La contraseña es requerida' }).trim(),
})

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { email, password } = result.data
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return { message: 'DATABASE_URL no configurada' }
  
  const sql = neon(dbUrl)

  try {
    const users = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`
    const user = users[0]

    if (!user) {
      return {
        message: 'Credenciales inválidas',
      }
    }

    const [salt, hash] = user.password.split(':')
    const hashedPassword = scryptSync(password, salt, 64).toString('hex')

    if (!timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedPassword, 'hex'))) {
      return {
        message: 'Credenciales inválidas',
      }
    }

    await createSession(user.id)
  } catch (error) {
    console.error('Login error:', error)
    return {
      message: 'Error al iniciar sesión',
    }
  }

  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
