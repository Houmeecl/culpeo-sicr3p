import { cn } from "@/lib/utils";

type MarkProps = {
  className?: string;
  compact?: boolean;
  invert?: boolean;
};

export function BrandMark({ className, compact, invert }: MarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={compact ? "size-9" : "size-11"} />
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "font-display font-semibold tracking-tight",
            compact ? "text-base" : "text-lg",
            invert ? "text-paper" : "text-navy",
          )}
        >
          Proveedor Regional
        </p>
        {!compact ? (
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-widest",
              invert ? "text-paper/70" : "text-ink-soft",
            )}
          >
            Región de Antofagasta
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="44" cy="16" r="8" fill="var(--color-sun)" />
      <path
        d="M4 40 L20 18 L32 32 L44 14 L62 40 Z"
        fill="var(--color-mountain)"
      />
      <path d="M4 40 L20 22 L28 34 L4 40 Z" fill="var(--color-clay)" />
      <path
        d="M36 34 L44 16 L60 40 L36 34 Z"
        fill="var(--color-mountain-deep)"
      />
      <path
        d="M0 42 C18 38 28 46 40 42 C52 38 58 44 64 42 L64 64 L0 64 Z"
        fill="var(--color-water)"
      />
      <path
        d="M6 46 C16 43 24 48 34 45 C44 42 52 47 58 45"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="1.6"
        strokeDasharray="1.6 3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
