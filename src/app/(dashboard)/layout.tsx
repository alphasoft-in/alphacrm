import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/session";
import { neon } from "@neondatabase/serverless";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let user = null;

  if (session?.userId) {
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`SELECT id, name, email, role FROM "User" WHERE id = ${session.userId} LIMIT 1`;
    user = users[0] as { id: string; name: string | null; email: string; role: string; };
  }

  return (
    <div className="flex h-screen bg-background text-zinc-950 overflow-hidden">
      <Sidebar aria-label="Navegación principal" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl pt-4 px-8 pb-4 flex flex-col gap-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
