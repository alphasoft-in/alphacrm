import { getSession } from "@/lib/session"
import { neon } from "@neondatabase/serverless"
import { ProfileForm } from "./profile-form"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const sql = neon(process.env.DATABASE_URL!)
  const users = await sql`SELECT name, email FROM "User" WHERE id = ${session.userId} LIMIT 1`
  const user = users[0]

  if (!user) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">Configuración de Perfil</h1>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Actualiza tu información personal y credenciales</p>
      </div>

      <div className="max-w-xl">
        <ProfileForm initialData={user} />
      </div>
    </div>
  )
}
