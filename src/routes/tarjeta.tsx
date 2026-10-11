import { createFileRoute } from "@tanstack/react-router";
import { CardIssuance } from "@/components/card-issuance";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/tarjeta")({
  head: () => ({
    meta: [{ title: "Tarjeta soportada · sicr3p/" }],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800&family=IBM+Plex+Mono:wght@500&display=swap",
      },
    ],
  }),
  component: TarjetaPage,
});

function TarjetaPage() {
  return (
    <SiteShell current="tarjeta">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
          Tarjeta soportada sicr3p/
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Tu tarjeta rosa sicr3p/: simple, mate y lista para tu wallet.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Conoce a tu cliente primero: verificamos identidad, perfil de riesgo y revisión ESG, y
          recién entonces emitimos la tarjeta virtual lista para Apple Wallet o Google Wallet.
        </p>
        <div className="mt-10">
          <CardIssuance />
        </div>
      </main>
    </SiteShell>
  );
}
