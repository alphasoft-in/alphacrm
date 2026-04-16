import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`UPDATE "User" SET name = NULL WHERE email = 'rtipiani@gmail.com'`
  console.log('User name updated to NULL')
}

main()
