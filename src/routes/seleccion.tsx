import { createFileRoute } from "@tanstack/react-router";
import { VoiceAgent } from "@/components/voice-agent";
import { parseAgentSearch } from "@/lib/visitor-context";

export const Route = createFileRoute("/seleccion")({
  validateSearch: parseAgentSearch,
  component: SeleccionPage,
});

function SeleccionPage() {
  const { empresa } = Route.useSearch();
  return <VoiceAgent layout="page" origen="seleccion" empresa={empresa} />;
}
