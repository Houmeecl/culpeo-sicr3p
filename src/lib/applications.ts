import { createServerFn } from "@tanstack/react-start";
import {
  COMMUNES,
  MEMBERSHIP_CLP,
  ROLES,
  SECTORS,
  WORKFORCE,
} from "@/lib/region";
import { formatRut, isValidRut } from "@/lib/rut";

export type ApplicationStatus = "pending" | "paid";
export type PaymentMethod = "tarjeta" | "transferencia";

export type Application = {
  id: number;
  folio: string;
  companyName: string;
  rut: string;
  sector: string;
  commune: string;
  workers: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  paymentMethod: PaymentMethod | null;
  paidAt: string | null;
  amountClp: number;
  createdAt: string;
};

export type ApplicationInput = {
  companyName: string;
  rut: string;
  sector: string;
  commune: string;
  workers: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
};

type ApplicationRow = {
  id: number;
  folio: string;
  company_name: string;
  rut: string;
  sector: string;
  commune: string;
  workers: string;
  contact_name: string;
  contact_role: string;
  email: string;
  phone: string;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  amount_clp: number;
  created_at: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMUNE_SET = new Set<string>(COMMUNES);
const SECTOR_SET = new Set<string>(SECTORS);
const WORKFORCE_SET = new Set<string>(WORKFORCE);
const ROLE_SET = new Set<string>(ROLES);

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parsePhone(value: unknown) {
  const raw = typeof value === "string" ? value : "";
  const digits = raw.replace(/\D/g, "");
  return digits.slice(0, 11);
}

function parseInput(input: unknown): ApplicationInput {
  if (!input || typeof input !== "object") {
    throw new Error("Datos incompletos.");
  }
  const data = input as Record<string, unknown>;
  const companyName = clip(data.companyName, 140);
  const rut = formatRut(clip(data.rut, 16));
  const sector = clip(data.sector, 80);
  const commune = clip(data.commune, 40);
  const workers = clip(data.workers, 20);
  const contactName = clip(data.contactName, 120);
  const contactRole = clip(data.contactRole, 80);
  const email = clip(data.email, 160).toLowerCase();
  const phone = parsePhone(data.phone);

  if (companyName.length < 3) throw new Error("Indica la razón social.");
  if (!isValidRut(rut)) throw new Error("El RUT no es válido.");
  if (!SECTOR_SET.has(sector)) throw new Error("Selecciona un giro.");
  if (!COMMUNE_SET.has(commune)) throw new Error("Selecciona una comuna de la región.");
  if (!WORKFORCE_SET.has(workers)) throw new Error("Indica el tamaño de la empresa.");
  if (contactName.length < 3) throw new Error("Indica el nombre de contacto.");
  if (!ROLE_SET.has(contactRole)) throw new Error("Selecciona el cargo.");
  if (!EMAIL_RE.test(email)) throw new Error("El correo no es válido.");
  if (phone.length < 8) throw new Error("Indica un teléfono de contacto.");

  return {
    companyName,
    rut,
    sector,
    commune,
    workers,
    contactName,
    contactRole,
    email,
    phone,
  };
}

function mapRow(row: ApplicationRow): Application {
  return {
    id: row.id,
    folio: row.folio,
    companyName: row.company_name,
    rut: row.rut,
    sector: row.sector,
    commune: row.commune,
    workers: row.workers,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    email: row.email,
    phone: row.phone,
    status: row.status === "paid" ? "paid" : "pending",
    paymentMethod:
      row.payment_method === "tarjeta" || row.payment_method === "transferencia"
        ? row.payment_method
        : null,
    paidAt: row.paid_at,
    amountClp: row.amount_clp,
    createdAt: row.created_at,
  };
}

function makeFolio() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 6);
  return `PR-${stamp}${rand}`.slice(0, 12);
}

async function getDb() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export const submitApplication = createServerFn({ method: "POST" })
  .validator(parseInput)
  .handler(async ({ data }): Promise<Application> => {
    const sql = await getDb();
    const folio = makeFolio();
    const rows = await sql<ApplicationRow>`
      insert into applications (
        folio, company_name, rut, sector, commune, workers,
        contact_name, contact_role, email, phone, status, amount_clp
      ) values (
        ${folio}, ${data.companyName}, ${data.rut}, ${data.sector},
        ${data.commune}, ${data.workers}, ${data.contactName},
        ${data.contactRole}, ${data.email}, ${data.phone},
        'pending', ${MEMBERSHIP_CLP}
      )
      returning
        id, folio, company_name, rut, sector, commune, workers,
        contact_name, contact_role, email, phone, status, payment_method,
        paid_at, amount_clp, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("No se pudo registrar la solicitud.");
    return mapRow(row);
  });

function parsePay(input: unknown): { folio: string; method: PaymentMethod } {
  if (!input || typeof input !== "object") throw new Error("Pago inválido.");
  const data = input as Record<string, unknown>;
  const folio = clip(data.folio, 20);
  const method = data.method === "tarjeta" || data.method === "transferencia"
    ? data.method
    : null;
  if (!folio.startsWith("PR-")) throw new Error("Folio inválido.");
  if (!method) throw new Error("Selecciona un medio de pago.");
  return { folio, method };
}

export const payApplication = createServerFn({ method: "POST" })
  .validator(parsePay)
  .handler(async ({ data }): Promise<Application> => {
    const sql = await getDb();
    const rows = await sql<ApplicationRow>`
      update applications
      set
        status = 'paid',
        payment_method = ${data.method},
        paid_at = now()
      where folio = ${data.folio} and status = 'pending'
      returning
        id, folio, company_name, rut, sector, commune, workers,
        contact_name, contact_role, email, phone, status, payment_method,
        paid_at, amount_clp, created_at
    `;
    const row = rows[0];
    if (!row) {
      const existing = await sql<ApplicationRow>`
        select
          id, folio, company_name, rut, sector, commune, workers,
          contact_name, contact_role, email, phone, status, payment_method,
          paid_at, amount_clp, created_at
        from applications
        where folio = ${data.folio}
        limit 1
      `;
      if (existing[0]?.status === "paid") return mapRow(existing[0]);
      throw new Error("No encontramos esa solicitud para cobrar.");
    }
    return mapRow(row);
  });

export const getApplication = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const folio =
      typeof input === "string"
        ? input
        : clip((input as { folio?: unknown } | null)?.folio, 20);
    if (!folio.startsWith("PR-")) throw new Error("Folio inválido.");
    return { folio };
  })
  .handler(async ({ data }): Promise<Application | null> => {
    const sql = await getDb();
    const rows = await sql<ApplicationRow>`
      select
        id, folio, company_name, rut, sector, commune, workers,
        contact_name, contact_role, email, phone, status, payment_method,
        paid_at, amount_clp, created_at
      from applications
      where folio = ${data.folio}
      limit 1
    `;
    return rows[0] ? mapRow(rows[0]) : null;
  });

export type ApplicationStats = {
  total: number;
  paid: number;
  pending: number;
  revenue: number;
};

export const listApplications = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ stats: ApplicationStats; items: Application[] }> => {
    const sql = await getDb();
    const [statsRow] = await sql<{
      total: number;
      paid: number;
      pending: number;
      revenue: number;
    }>`
      select
        count(*)::int as total,
        count(*) filter (where status = 'paid')::int as paid,
        count(*) filter (where status = 'pending')::int as pending,
        coalesce(sum(amount_clp) filter (where status = 'paid'), 0)::int as revenue
      from applications
    `;
    const items = await sql<ApplicationRow>`
      select
        id, folio, company_name, rut, sector, commune, workers,
        contact_name, contact_role, email, phone, status, payment_method,
        paid_at, amount_clp, created_at
      from applications
      order by created_at desc
      limit 200
    `;
    return {
      stats: statsRow ?? { total: 0, paid: 0, pending: 0, revenue: 0 },
      items: items.map(mapRow),
    };
  },
);
