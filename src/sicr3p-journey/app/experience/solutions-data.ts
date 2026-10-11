import { Handshake, Leaf, Sprout, TrendingUp, type LucideIcon } from "lucide-react";

/** Soluciones que SICR3P/ articula; las entregan aliados especializados. */
export const SOLUTIONS: { id: string; title: string; line: string; icon: LucideIcon }[] = [
  {
    id: "desarrollo",
    title: "Desarrollo empresarial",
    line: "Capacitación y acompañamiento",
    icon: TrendingUp,
  },
  { id: "b2b", title: "Oportunidades B2B", line: "Conecta con nuevas empresas", icon: Handshake },
  {
    id: "sostenibilidad",
    title: "Sostenibilidad",
    line: "Prepárate para un futuro más verde",
    icon: Leaf,
  },
  {
    id: "terceros",
    title: "Soluciones de terceros",
    line: "Financiamiento, seguros, leasing y más, de aliados",
    icon: Sprout,
  },
];
