import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  listApplications,
  type Application,
  type ApplicationStats,
} from "@/lib/applications";
import { formatClp, formatDateTime } from "@/lib/region";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tablero")({
  component: TableroPage,
});

type Filter = "all" | "pending" | "paid";

function TableroPage() {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [items, setItems] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listApplications()
      .then((result) => {
        if (cancelled) return;
        setStats(result.stats);
        setItems(result.items);
        setLoaded(true);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "No se pudo cargar el tablero.");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!needle) return true;
      return (
        item.companyName.toLowerCase().includes(needle) ||
        item.folio.toLowerCase().includes(needle) ||
        item.commune.toLowerCase().includes(needle) ||
        item.email.toLowerCase().includes(needle)
      );
    });
  }, [items, filter, query]);

  return (
    <SiteShell current="tablero">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          Tablero institucional
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Datos capturados y membresías vendidas.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          Cada incorporación queda aquí: empresa, contacto, estado de pago y
          folio. El ejecutivo usa esta bandeja para agendar el diagnóstico.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Solicitudes" value={stats ? String(stats.total) : "—"} />
          <Stat label="Pendientes" value={stats ? String(stats.pending) : "—"} />
          <Stat label="Pagadas" value={stats ? String(stats.paid) : "—"} />
          <Stat
            label="Recaudado"
            value={stats ? formatClp(stats.revenue) : "—"}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "paid"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "h-10 rounded-full px-4 text-sm font-medium transition-colors duration-150",
                  filter === key
                    ? "bg-navy text-paper"
                    : "bg-paper-raised text-navy shadow-[var(--shadow-border)]",
                )}
              >
                {key === "all" ? "Todas" : key === "pending" ? "Pendientes" : "Pagadas"}
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar empresa, folio o comuna"
              className="h-11 w-full rounded-full bg-paper-raised pl-10 pr-4 text-sm text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-navy/30"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-danger">{error}</p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl bg-paper-raised shadow-[var(--shadow-border)]">
          {!loaded ? (
            <p className="p-8 text-sm text-ink-soft">Cargando solicitudes…</p>
          ) : visible.length === 0 ? (
            <div className="p-8">
              <p className="font-display text-lg font-semibold text-navy">
                Aún no hay solicitudes en esta vista.
              </p>
              <p className="mt-2 max-w-lg text-sm text-ink-soft">
                La primera incorporación aparece aquí en cuanto se registra.
                Puedes capturar una ahora.
              </p>
              <Link
                to="/incorporar"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-4 text-sm font-medium text-paper"
              >
                Incorporar empresa
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((item) => (
                <li key={item.folio}>
                  <Link
                    to="/comprobante/$folio"
                    params={{ folio: item.folio }}
                    className="flex flex-col gap-3 px-4 py-4 transition-colors duration-150 hover:bg-sand/40 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display font-semibold text-navy">
                        {item.companyName}
                      </p>
                      <p className="mt-1 truncate text-sm text-ink-soft">
                        {item.folio} · {item.commune} · {item.contactName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          item.status === "paid"
                            ? "bg-success/15 text-success"
                            : "bg-copper/15 text-copper-deep",
                        )}
                      >
                        {item.status === "paid" ? "Pagada" : "Pendiente"}
                      </span>
                      <span className="tabular-nums text-sm font-medium text-navy">
                        {formatClp(item.amountClp)}
                      </span>
                      <span className="hidden text-xs text-ink-soft sm:inline">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper-raised p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-navy">
        {value}
      </p>
    </div>
  );
}
