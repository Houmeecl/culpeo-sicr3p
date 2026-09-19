import { createFileRoute } from "@tanstack/react-router";
import { IncorporarFlow } from "@/components/incorporar-flow";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/incorporar")({
  component: IncorporarPage,
});

function IncorporarPage() {
  return (
    <SiteShell current="incorporar">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          Incorporación
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Capturamos los datos de tu empresa y activamos la membresía.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Inscripción, primer pago de $120.000 y agenda de diagnóstico con el
          ejecutivo asignado. El perfil de desarrollo no se compra: se demuestra.
        </p>
        <div className="mt-10">
          <IncorporarFlow />
        </div>
      </main>
    </SiteShell>
  );
}
