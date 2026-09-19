import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { COMMUNES } from "@/lib/region";
import { cn } from "@/lib/utils";

type ShellProps = {
  children: ReactNode;
  current?: "home" | "incorporar" | "tablero";
};

export function SiteShell({ children, current = "home" }: ShellProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader current={current} />
      {children}
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ current }: { current: ShellProps["current"] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6">
        <Link to="/" className="min-w-0 shrink-0">
          <BrandMark compact />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          <Link
            to="/"
            className={cn(
              "transition-colors hover:text-navy",
              current === "home" && "font-medium text-navy",
            )}
          >
            Agente
          </Link>
          <Link
            to="/incorporar"
            className={cn(
              "transition-colors hover:text-navy",
              current === "incorporar" && "font-medium text-navy",
            )}
          >
            Incorporar
          </Link>
          <Link
            to="/tablero"
            className={cn(
              "transition-colors hover:text-navy",
              current === "tablero" && "font-medium text-navy",
            )}
          >
            Tablero
          </Link>
        </nav>
        <Link
          to="/incorporar"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-4 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          Incorporar
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <BrandMark invert />
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper/70">
          Preparar empresas locales para competir mejor, financiarse
          responsablemente y crecer de manera sostenible. Una plataforma
          conecta. Una institución prepara, acompaña, mide y rinde cuenta.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/70">
          <Link to="/" className="hover:text-paper">
            Agente de voz
          </Link>
          <Link to="/incorporar" className="hover:text-paper">
            Incorporación
          </Link>
          <Link to="/tablero" className="hover:text-paper">
            Tablero de solicitudes
          </Link>
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.14em] text-paper/50">
          {COMMUNES.join(" · ")}
        </p>
      </div>
    </footer>
  );
}
