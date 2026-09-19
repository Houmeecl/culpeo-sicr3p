import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Printer } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getApplication } from "@/lib/applications";
import { formatClp, formatDateTime } from "@/lib/region";

export const Route = createFileRoute("/comprobante/$folio")({
  loader: async ({ params }) => {
    const application = await getApplication({ data: { folio: params.folio } });
    return { application };
  },
  component: ComprobantePage,
});

function ComprobantePage() {
  const { application } = Route.useLoaderData();

  if (!application) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-navy">
            No encontramos ese folio.
          </h1>
          <p className="mt-3 text-ink-soft">
            Revisa el código o vuelve al tablero de solicitudes.
          </p>
          <Link
            to="/tablero"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-navy px-5 text-sm font-medium text-paper"
          >
            Ir al tablero
          </Link>
        </main>
      </SiteShell>
    );
  }

  const paid = application.status === "paid";

  return (
    <SiteShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl bg-paper-raised p-6 shadow-[var(--shadow-border)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            {paid ? "Comprobante de membresía" : "Solicitud registrada"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy">
            {application.folio}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {paid
              ? "Primer mes pagado. El ejecutivo coordinará el diagnóstico inicial."
              : "Datos capturados. Falta el pago del primer mes para activar."}
          </p>

          <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <Item label="Empresa" value={application.companyName} />
            <Item label="RUT" value={application.rut} />
            <Item label="Comuna" value={application.commune} />
            <Item label="Giro" value={application.sector} />
            <Item label="Contacto" value={application.contactName} />
            <Item label="Correo" value={application.email} />
            <Item
              label="Monto"
              value={formatClp(application.amountClp)}
            />
            <Item
              label="Estado"
              value={paid ? "Pagada" : "Pendiente de pago"}
            />
            <Item
              label="Medio"
              value={
                application.paymentMethod === "tarjeta"
                  ? "Tarjeta"
                  : application.paymentMethod === "transferencia"
                    ? "Transferencia"
                    : "—"
              }
            />
            <Item
              label={paid ? "Pagado" : "Ingresado"}
              value={formatDateTime(application.paidAt ?? application.createdAt)}
            />
          </dl>

          {paid ? (
            <ol className="mt-8 space-y-3 rounded-xl bg-paper p-4 text-sm text-ink ring-1 ring-line">
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                Contrato de Adhesión en curso.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                Diagnóstico inicial con el ejecutivo asignado.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                Cálculo del Índice de Retención y apertura de la Academia.
              </li>
            </ol>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-paper px-5 text-sm font-medium text-navy shadow-[var(--shadow-border)]"
            >
              <Printer className="size-4" />
              Imprimir
            </button>
            <Link
              to="/tablero"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-5 text-sm font-medium text-paper"
            >
              Ver tablero
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
      <dd className="mt-1 font-medium text-navy">{value}</dd>
    </div>
  );
}
