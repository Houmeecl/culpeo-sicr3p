import { createFileRoute } from "@tanstack/react-router";
import { VoiceAgent } from "@/components/voice-agent";
import { parseAgentSearch } from "@/lib/visitor-context";

export const Route = createFileRoute("/embed")({
  validateSearch: parseAgentSearch,
  component: EmbedAgent,
});

function EmbedAgent() {
  const { empresa } = Route.useSearch();
  return <VoiceAgent layout="embed" origen="seleccion" empresa={empresa} />;
}
