import { createFileRoute } from "@tanstack/react-router";
import { JourneyApp } from "@/journey";
import journeyCss from "@/journey/journey.css?url";

type Search = { modo?: "evento" | "real" };

export const Route = createFileRoute("/journey")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    modo: search.modo === "real" ? "real" : search.modo === "evento" ? "evento" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "SICR3P/ Journey" },
      { name: "description", content: "Recorrido de incorporación a la red SICR3P/." },
    ],
    links: [
      { rel: "stylesheet", href: journeyCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  component: JourneyPage,
});

const EVENT = { mode: "event" as const };
const REAL = { mode: "real" as const };

function JourneyPage() {
  const { modo } = Route.useSearch();
  // Por defecto modo evento: es la primera presentación del módulo.
  return <JourneyApp config={modo === "real" ? REAL : EVENT} />;
}
