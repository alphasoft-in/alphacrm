"use server"

import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";
import { fromZonedTime } from "date-fns-tz";

const LIMA_TZ = 'America/Lima';
const parseDate = (dateStr: string) => fromZonedTime(dateStr, LIMA_TZ);

const JSON_PE_BASE_URL = 'https://api.json.pe/api';

export async function queryDocument(type: 'dni' | 'ruc', number: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: 'Configuración de DB faltante' };
  const sql = neon(dbUrl);
  try {
    const results = await sql`SELECT data FROM "DocumentCache" WHERE "docType" = ${type} AND "docNumber" = ${number} LIMIT 1`;
    if (results && results.length > 0) return { success: true, data: results[0].data as any };
    const token = process.env.JSON_PE_TOKEN;
    if (!token) return { success: false, error: 'API Token no configurado' };
    const endpoint = type === 'dni' ? 'dni' : 'ruc';
    const body = type === 'dni' ? { dni: number } : { ruc: number };
    const response = await fetch(`${JSON_PE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok || data.error || data.success === false) return { success: false, error: data.message || data.error };
    const finalData = data.data || data;
    try {
      const id = `${type}-${number}`;
      await sql`INSERT INTO "DocumentCache" (id, "docType", "docNumber", data, "updatedAt") VALUES (${id}, ${type}, ${number}, ${JSON.stringify(finalData)}, NOW()) ON CONFLICT ("docType", "docNumber") DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()`;
    } catch (e) {}
    return { success: true, data: finalData };
  } catch (error) { return { success: false, error: 'Error de conexión' }; }
}

export async function getCustomers() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try { return await sql`SELECT * FROM "Customer" ORDER BY "createdAt" DESC`; } catch (e) { return []; }
}

export async function saveCustomer(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false };
  const sql = neon(dbUrl);
  try {
    const id = crypto.randomUUID();
    const normalizedStatus = (data.status?.toUpperCase().includes("ACTIVO") || data.status?.toUpperCase().includes("ACTIVE")) ? 'ACTIVE' : (data.status?.toUpperCase().includes("INACTIVO") ? 'INACTIVE' : 'ACTIVE');
    await sql`INSERT INTO "Customer" (id, name, email, phone, company, address, district, "docType", "docNumber", position, "status", "condition", "updatedAt") VALUES (${id}, ${data.name}, ${data.email || null}, ${data.phone || null}, ${data.company || data.name}, ${data.address || null}, ${data.district || null}, ${data.docType}, ${data.docNumber}, ${data.position || null}, ${normalizedStatus}, ${data.condition || null}, NOW())`;
    return { success: true, id };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateCustomer(id: string, data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false };
  const sql = neon(dbUrl);
  try {
    const normalizedStatus = (data.status?.toUpperCase().includes("ACTIVO") || data.status?.toUpperCase().includes("ACTIVE")) ? 'ACTIVE' : (data.status?.toUpperCase().includes("INACTIVO") ? 'INACTIVE' : 'ACTIVE');
    await sql`UPDATE "Customer" SET name = ${data.name}, email = ${data.email || null}, phone = ${data.phone || null}, company = ${data.company || data.name}, address = ${data.address || null}, district = ${data.district || null}, "docType" = ${data.docType}, "docNumber" = ${data.docNumber}, position = ${data.position || null}, "status" = ${normalizedStatus}, "condition" = ${data.condition || null}, "updatedAt" = NOW() WHERE id = ${id}`;
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deactivateCustomer(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    await sql`UPDATE "Customer" SET status = 'INACTIVE', "updatedAt" = NOW() WHERE id = ${id}`;
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getCustomerByDoc(docNumber: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    const results = await sql`SELECT * FROM "Customer" WHERE "docNumber" = ${docNumber} LIMIT 1`;
    if (results.length > 0) {
      const customer = results[0];
      const subscriptions = await sql`
        SELECT s.id, ser.name as "serviceName", s."productName"
        FROM "Subscription" s
        JOIN "Service" ser ON s."serviceId" = ser.id
        WHERE s."customerId" = ${customer.id} AND s.status = 'ACTIVE'
      `;
      return { success: true, customer, subscriptions };
    }
    return { success: false, error: "Cliente no encontrado" };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// --- SERVICES ---
export async function getServices() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try { return await sql`SELECT * FROM "Service" ORDER BY "createdAt" DESC`; } catch (e) { return []; }
}

export async function saveService(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    const id = crypto.randomUUID();
    await sql`INSERT INTO "Service" (id, name, description, "basePrice", "billingCycle", "taxStatus", "updatedAt") VALUES (${id}, ${data.name}, ${data.description || null}, ${data.basePrice}, ${data.billingCycle}, ${data.taxStatus || 'INC_IGV'}, NOW())`;
    return { success: true, id };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateService(id: string, data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    await sql`UPDATE "Service" SET name = ${data.name}, description = ${data.description || null}, "basePrice" = ${data.basePrice}, "billingCycle" = ${data.billingCycle}, "taxStatus" = ${data.taxStatus || 'INC_IGV'}, "updatedAt" = NOW() WHERE id = ${id}`;
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteService(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try { await sql`DELETE FROM "Service" WHERE id = ${id}`; return { success: true }; } catch (e: any) { return { success: false, error: e.message || 'Tiene suscripciones' }; }
}

// --- PAYMENTS ---
export async function getPayments() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try {
    return await sql`
      SELECT p.*, c.name as "customerName", c."docNumber" as "customerDoc", ser.name as "serviceName", d.name as "dealName"
      FROM "Payment" p
      LEFT JOIN "Customer" c ON p."customerId" = c.id
      LEFT JOIN "Subscription" s ON p."subscriptionId" = s.id
      LEFT JOIN "Service" ser ON s."serviceId" = ser.id
      LEFT JOIN "Deal" d ON p."dealId" = d.id
      ORDER BY p."paymentDate" DESC, p."createdAt" DESC
    `;
  } catch (e) { return []; }
}

export async function savePayment(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    if (data.id) {
      await sql`
        UPDATE "Payment" SET 
          amount = ${data.amount}, 
          "paymentDate" = ${parseDate(data.paymentDate)}, 
          status = ${data.status}, 
          method = ${data.method}, 
          "customerId" = ${data.customerId}, 
          "subscriptionId" = ${data.subscriptionId || null}, 
          "dealId" = ${data.dealId || null}, 
          notes = ${data.notes || null}, 
          "operationNumber" = ${data.operationNumber || null}, 
          "targetAccount" = ${data.targetAccount || null}
        WHERE id = ${data.id}
      `;
    } else {
      const id = data.id || crypto.randomUUID();
      await sql`
        INSERT INTO "Payment" (id, amount, "paymentDate", status, method, "customerId", "subscriptionId", "dealId", notes, "operationNumber", "targetAccount")
        VALUES (${id}, ${data.amount}, ${parseDate(data.paymentDate)}, ${data.status}, ${data.method}, ${data.customerId}, ${data.subscriptionId || null}, ${data.dealId || null}, ${data.notes || null}, ${data.operationNumber || null}, ${data.targetAccount || null})
      `;
    }
    revalidatePath("/payments");
    if (data.dealId) revalidatePath("/contracts");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deletePayment(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: 'Database URL not configured' };
  const sql = neon(dbUrl);
  try {
    await sql`DELETE FROM "Payment" WHERE id = ${id}`;
    revalidatePath("/payments");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Error al eliminar el pago' };
  }
}

// --- DEALS (CONTRATOS) ---
export async function getDeals() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try {
    return await sql`
      SELECT d.*, c.name as "customerName", c."docNumber", c."docType", c.address, c.district, c.email as "customerEmail", c.phone as "customerPhone",
      (SELECT SUM(amount) FROM "Payment" WHERE "dealId" = d.id AND status = 'COMPLETED') as "paidAmount"
      FROM "Deal" d
      JOIN "Customer" c ON d."customerId" = c.id
      ORDER BY d."dealDate" DESC
    `;
  } catch (error) { return []; }
}

export async function saveDeal(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    if (data.id) {
       await sql`UPDATE "Deal" SET name = ${data.name}, description = ${data.description || null}, "totalAmount" = ${data.totalAmount}, "downPayment" = ${parseFloat(data.downPayment || 0)}, status = ${data.status || 'OPEN'}, "contactMethod" = ${data.contactMethod || null}, "paymentTerms" = ${data.paymentTerms || "50-50"}, installments = ${parseInt(data.installments || 1)}, "dealDate" = ${parseDate(data.dealDate)}, "updatedAt" = NOW() WHERE id = ${data.id}`;
    } else {
       await sql`INSERT INTO "Deal" (id, "customerId", name, description, "totalAmount", "downPayment", status, "contactMethod", "paymentTerms", installments, "dealDate", "updatedAt") VALUES (${crypto.randomUUID()}, ${data.customerId}, ${data.name}, ${data.description || null}, ${data.totalAmount}, ${parseFloat(data.downPayment || 0)}, ${data.status || 'OPEN'}, ${data.contactMethod || null}, ${data.paymentTerms || "50-50"}, ${parseInt(data.installments || 1)}, ${parseDate(data.dealDate)}, NOW())`;
    }
    revalidatePath("/contracts");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteDeal(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try { await sql`DELETE FROM "Deal" WHERE id = ${id}`; revalidatePath("/contracts"); return { success: true }; } catch (e: any) { return { success: false, error: e.message || 'Tiene pagos' }; }
}

// --- SUBSCRIPTIONS ---
export async function getSubscriptions() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try { return await sql`SELECT s.*, c.name as "customerName", c."docType", c."docNumber", ser.name as "serviceName", ser."billingCycle", s."nextRenewal" FROM "Subscription" s JOIN "Customer" c ON s."customerId" = c.id JOIN "Service" ser ON s."serviceId" = ser.id ORDER BY s."createdAt" DESC`; } catch (e) { return []; }
}

export async function getUpcomingRenewals() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try {
    // Retorna renovaciones de los próximos 45 días, ya vencidas o sin fecha definida
    return await sql`
      SELECT s.id, c.name as "customerName", ser.name as "serviceName", s."nextRenewal", s.price
      FROM "Subscription" s
      JOIN "Customer" c ON s."customerId" = c.id
      JOIN "Service" ser ON s."serviceId" = ser.id
      WHERE (s.status = 'ACTIVE' OR s.status = 'active')
      AND (
        s."nextRenewal" IS NULL 
        OR s."nextRenewal" <= NOW() + INTERVAL '45 days'
      )
      ORDER BY COALESCE(s."nextRenewal", '1900-01-01') ASC
    `;
  } catch (e) { return []; }
}

export async function saveSubscription(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    const serviceRes = await sql`SELECT "billingCycle", "basePrice" FROM "Service" WHERE id = ${data.serviceId}`;
    if (serviceRes.length === 0) return { success: false, error: "Servicio no encontrado" };
    const service = serviceRes[0];
    const startDate = new Date(data.startDate);
    const nextRenewal = new Date(startDate);
    
    // Logic for next renewal calculation
    if (service.billingCycle === 'MONTHLY') nextRenewal.setDate(nextRenewal.getDate() + 30);
    else if (service.billingCycle === 'QUARTERLY') nextRenewal.setDate(nextRenewal.getDate() + 90);
    else if (service.billingCycle === 'SEMI_ANNUAL') nextRenewal.setDate(nextRenewal.getDate() + 180);
    else if (service.billingCycle === 'ANNUAL') nextRenewal.setDate(nextRenewal.getDate() + 365);
    else nextRenewal.setDate(nextRenewal.getDate() + 30); // Default

    const price = data.price ?? parseFloat(service.basePrice);
    if (data.id) {
       await sql`UPDATE "Subscription" SET "serviceId" = ${data.serviceId}, "productName" = ${data.productName || null}, "startDate" = ${parseDate(data.startDate)}, "nextRenewal" = ${nextRenewal}, "status" = ${data.status || 'ACTIVE'}, "price" = ${price}, "updatedAt" = NOW() WHERE id = ${data.id}`;
    } else {
       await sql`INSERT INTO "Subscription" (id, "customerId", "serviceId", "productName", "startDate", "nextRenewal", "status", "price", "createdAt", "updatedAt") VALUES (${crypto.randomUUID()}, ${data.customerId}, ${data.serviceId}, ${data.productName || null}, ${parseDate(data.startDate)}, ${nextRenewal}, ${data.status || 'ACTIVE'}, ${price}, NOW(), NOW())`;
    }
    revalidatePath("/subscriptions");
    revalidatePath("/renewals");
    revalidatePath("/"); // Update global navbar notifications
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteSubscription(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: 'Database URL not configured' };
  const sql = neon(dbUrl);
  try {
    await sql`DELETE FROM "Subscription" WHERE id = ${id}`;
    revalidatePath("/subscriptions");
    revalidatePath("/renewals");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Error al eliminar suscripción' };
  }
}

export async function renewSubscription(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false };
  const sql = neon(dbUrl);
  try {
    const subRes = await sql`
      SELECT s.*, ser."billingCycle" 
      FROM "Subscription" s 
      JOIN "Service" ser ON s."serviceId" = ser.id 
      WHERE s.id = ${id}
    `;
    if (subRes.length === 0) return { success: false, error: "No encontrada" };
    const sub = subRes[0];
    
    let nextDate = new Date(sub.nextRenewal);
    // Si ya venció, empezamos desde hoy. Si no, acumulamos desde el vencimiento.
    if (nextDate < new Date()) nextDate = new Date();

    if (sub.billingCycle === 'MONTHLY') nextDate.setDate(nextDate.getDate() + 30);
    else if (sub.billingCycle === 'QUARTERLY') nextDate.setDate(nextDate.getDate() + 90);
    else if (sub.billingCycle === 'SEMI_ANNUAL') nextDate.setDate(nextDate.getDate() + 180);
    else if (sub.billingCycle === 'ANNUAL') nextDate.setDate(nextDate.getDate() + 365);

    await sql`UPDATE "Subscription" SET "nextRenewal" = ${nextDate}, "updatedAt" = NOW() WHERE id = ${id}`;
    revalidatePath("/subscriptions");
    revalidatePath("/renewals");
    return { success: true, nextRenewal: nextDate };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getSubscriptionsByCustomer(customerId: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try { return await sql`SELECT s.id, ser.name as "serviceName", s.price FROM "Subscription" s JOIN "Service" ser ON s."serviceId" = ser.id WHERE s."customerId" = ${customerId} AND s.status = 'ACTIVE'`; } catch (e) { return []; }
}

export async function getDealsByCustomer(customerId: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try { 
    return await sql`
      SELECT id, name, "totalAmount",
      COALESCE((SELECT SUM(amount) FROM "Payment" WHERE "dealId" = "Deal".id AND status = 'COMPLETED'), 0) as "paidAmount"
      FROM "Deal" 
      WHERE "customerId" = ${customerId} AND status != 'CANCELLED'
    `; 
  } catch (e) { return []; }
}

export async function getDashboardStats() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  const sql = neon(dbUrl);
  try {
    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM "Customer"`,
      sql`SELECT (SELECT COUNT(*) FROM "Service") + (SELECT COUNT(*) FROM "Deal") as count`,
      sql`SELECT (SELECT COUNT(*) FROM "Subscription" WHERE status = 'ACTIVE') + (SELECT COUNT(*) FROM "Deal" WHERE status != 'CANCELLED') as count`,
      sql`SELECT SUM(amount) as total FROM "Payment" WHERE status = 'COMPLETED'`,
      sql`
        SELECT p.id, c.name as "customerName", 
        COALESCE(ser.name, d.name) as "serviceName", 
        p."paymentDate" as "date"
        FROM "Payment" p
        JOIN "Customer" c ON p."customerId" = c.id
        LEFT JOIN "Subscription" s ON p."subscriptionId" = s.id
        LEFT JOIN "Service" ser ON s."serviceId" = ser.id
        LEFT JOIN "Deal" d ON p."dealId" = d.id
        WHERE p.status = 'COMPLETED'
        ORDER BY p."createdAt" DESC
        LIMIT 10
      `,
      // Nueva consulta para datos de gráficos (últimos 6 meses)
      sql`
        SELECT 
          EXTRACT(MONTH FROM "paymentDate") as month_num,
          SUM(amount) as total
        FROM "Payment"
        WHERE status = 'COMPLETED' AND "paymentDate" >= NOW() - INTERVAL '6 months'
        GROUP BY month_num
        ORDER BY month_num
      `,
      sql`
        SELECT 
          EXTRACT(MONTH FROM date) as month_num,
          SUM(amount) as total
        FROM "PettyCash"
        WHERE type = 'EXPENSE' AND date >= NOW() - INTERVAL '6 months'
        GROUP BY month_num
        ORDER BY month_num
      `
    ]);

    const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const targetMonthIdx = (currentMonth - i + 12) % 12;
      const targetMonthNum = targetMonthIdx + 1; // 1-12
      
      const rev = stats[5].find((r: any) => parseInt(r.month_num) === targetMonthNum);
      const exp = stats[6].find((e: any) => parseInt(e.month_num) === targetMonthNum);
      
      last6Months.push({
        month: monthNames[targetMonthIdx],
        ingresos: parseFloat(rev?.total || 0),
        egresos: parseFloat(exp?.total || 0)
      });
    }

    return {
      totalCustomers: parseInt(stats[0][0].count),
      totalServices: parseInt(stats[1][0].count),
      activeSubscriptions: parseInt(stats[2][0].count),
      totalRevenue: parseFloat(stats[3][0].total || 0),
      recentActivity: stats[4],
      chartData: last6Months
    };
  } catch (e) { return null; }
}

// --- CAJA CHICA ---
export async function getPettyCashMovements() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return [];
  const sql = neon(dbUrl);
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "PettyCash" (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        type TEXT NOT NULL, -- 'INCOME' | 'EXPENSE'
        category TEXT,
        "customerId" TEXT,
        "customerName" TEXT, -- Para casos donde no es cliente del sistema
        date TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    // Intentamos agregar el campo customerId por si la tabla ya existía
    try { await sql`ALTER TABLE "PettyCash" ADD COLUMN IF NOT EXISTS "customerId" TEXT`; } catch(e) {}
    try { await sql`ALTER TABLE "PettyCash" ADD COLUMN IF NOT EXISTS "customerName" TEXT`; } catch(e) {}
    try { await sql`ALTER TABLE "PettyCash" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT`; } catch(e) {}

    return await sql`
      SELECT pc.*, c.name as "linkedCustomerName", c."docNumber" as "linkedCustomerDoc", s."productName" as "linkedSubscriptionName"
      FROM "PettyCash" pc
      LEFT JOIN "Customer" c ON pc."customerId" = c.id
      LEFT JOIN "Subscription" s ON pc."subscriptionId" = s.id
      ORDER BY pc.date DESC, pc."createdAt" DESC
    `;
  } catch (e) { return []; }
}

export async function savePettyCashMovement(data: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false };
  const sql = neon(dbUrl);
  try {
    const id = data.id || crypto.randomUUID();
    const amount = parseFloat(data.amount);
    if (data.id) {
       await sql`UPDATE "PettyCash" SET description = ${data.description}, amount = ${amount}, type = ${data.type}, category = ${data.category}, "customerId" = ${data.customerId || null}, "customerName" = ${data.customerName || null}, "subscriptionId" = ${data.subscriptionId || null}, date = ${parseDate(data.date)} WHERE id = ${data.id}`;
    } else {
       await sql`INSERT INTO "PettyCash" (id, description, amount, type, category, "customerId", "customerName", "subscriptionId", date) VALUES (${id}, ${data.description}, ${amount}, ${data.type}, ${data.category}, ${data.customerId || null}, ${data.customerName || null}, ${data.subscriptionId || null}, ${parseDate(data.date)})`;
       
       // CRUCE DE INFORMACIÓN: Si es un ingreso por amortización vinculado a una suscripción, crear pago
       if (data.type === 'INCOME' && data.category === 'AMORTIZACION' && data.subscriptionId) {
         await sql`
           INSERT INTO "Payment" (id, amount, "paymentDate", status, method, "customerId", "subscriptionId", notes)
           VALUES (${crypto.randomUUID()}, ${amount}, ${parseDate(data.date)}, 'COMPLETED', 'CASH', ${data.customerId}, ${data.subscriptionId}, ${'AMORTIZACIÓN REGISTRADA VÍA CAJA CHICA: ' + data.description})
         `;
       }
    }
    revalidatePath("/petty-cash");
    revalidatePath("/payments");
    revalidatePath("/subscriptions");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deletePettyCashMovement(id: string) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { success: false, error: "Conexión no configurada" };
  const sql = neon(dbUrl);
  try {
    await sql`DELETE FROM "PettyCash" WHERE id = ${id}`;
    revalidatePath("/petty-cash");
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
