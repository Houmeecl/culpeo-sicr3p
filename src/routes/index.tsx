import { createFileRoute } from "@tanstack/react-router";
import { VoiceAgent } from "@/components/voice-agent";
import { parseAgentSearch } from "@/lib/visitor-context";

export const Route = createFileRoute("/")({
  validateSearch: parseAgentSearch,
  component: Home,
});

function Home() {
  const { empresa } = Route.useSearch();
  return <VoiceAgent layout="page" origen="seleccion" empresa={empresa} />;
}
