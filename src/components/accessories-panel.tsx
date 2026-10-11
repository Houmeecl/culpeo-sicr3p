import { useState } from "react";
import { BadgeCheck, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ACCESSORIES, type AccessoryKind } from "@/lib/card-kyc";
import { cn } from "@/lib/utils";

const PINK = "#ffb3c7";
const PINK_DEEP = "#f58fb0";
const INK = "#0F1B3D";
const VIOLET = "#6B5CF6";

export function AccessoriesPanel({
  ordered,
  onOrder,
}: {
  ordered: AccessoryKind[];
  onOrder: (kinds: AccessoryKind[]) => void;
}) {
  const [picked, setPicked] = useState<AccessoryKind[]>([]);

  function toggle(kind: AccessoryKind) {
    setPicked((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));
  }

  function order() {
    if (picked.length === 0) return;
    onOrder(picked);
    toast.success(
      picked.length === 1 ? "Accesorio agregado a tu pedido" : "Accesorios agregados a tu pedido",
    );
    setPicked([]);
  }

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy">Accesorios para tu cartera</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Combínalos con tu tarjeta. Todos vienen en el mismo rosa sicr3p/.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACCESSORIES.map(({ kind, name, detail }) => {
          const isOrdered = ordered.includes(kind);
          const isPicked = picked.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              disabled={isOrdered}
              aria-pressed={isPicked}
              onClick={() => toggle(kind)}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-lg bg-paper p-3 text-left ring-1 ring-line transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.98] sm:p-4",
                isPicked && "ring-2 ring-violet",
                isOrdered && "opacity-90 active:scale-100",
              )}
            >
              <span
                className={cn(
                  "absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full text-white",
                  isOrdered
                    ? "bg-success"
                    : isPicked
                      ? "bg-violet"
                      : "bg-transparent ring-1 ring-line",
                )}
              >
                {isOrdered || isPicked ? <Check className="size-3.5" /> : null}
              </span>
              <span className="flex h-24 w-full items-center justify-center rounded-md bg-violet-soft/60">
                <AccessoryArt kind={kind} />
              </span>
              <span className="text-sm font-semibold text-navy">{name}</span>
              <span className="text-xs leading-snug text-ink-soft">
                {isOrdered ? "Pedido registrado" : detail}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={order}
          disabled={picked.length === 0}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-violet px-5 text-sm font-medium text-white transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100"
        >
          <ShoppingBag className="size-4" />
          {picked.length > 0
            ? `Pedir ${picked.length} accesorio${picked.length > 1 ? "s" : ""}`
            : "Elige tus accesorios"}
        </button>
        {ordered.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-success">
            <BadgeCheck className="size-4" />
            {ordered.length} en tu pedido (demo, sin despacho real)
          </span>
        ) : null}
      </div>
    </div>
  );
}

function AccessoryArt({ kind }: { kind: AccessoryKind }) {
  if (kind === "tarjetero") {
    return (
      <svg viewBox="0 0 120 90" className="h-20 w-auto" aria-hidden="true">
        <rect
          x="38"
          y="6"
          width="44"
          height="64"
          rx="6"
          fill={PINK}
          stroke={INK}
          strokeOpacity=".15"
        />
        <text
          x="46"
          y="62"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="13"
          fill={INK}
        >
          s3/
        </text>
        <path
          d="M28 34h64a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6z"
          fill={PINK_DEEP}
        />
        <path d="M28 38h64" stroke="#fff" strokeOpacity=".6" strokeDasharray="3 3" />
        <path d="M27 79h66" stroke="#fff" strokeOpacity=".5" strokeDasharray="3 3" />
        <text
          x="50"
          y="66"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="16"
          fill={VIOLET}
        >
          3/
        </text>
      </svg>
    );
  }
  if (kind === "llavero") {
    return (
      <svg viewBox="0 0 120 90" className="h-20 w-auto" aria-hidden="true">
        <circle cx="60" cy="16" r="11" fill="none" stroke="#b9b4c4" strokeWidth="4" />
        <rect x="53" y="24" width="14" height="9" rx="3" fill="#b9b4c4" />
        <rect
          x="38"
          y="32"
          width="44"
          height="54"
          rx="18"
          fill={PINK}
          stroke={INK}
          strokeOpacity=".15"
        />
        <g fill="none" stroke={VIOLET} strokeWidth="2.6" strokeLinecap="round">
          <path d="M54 52c2 3 2 6 0 9" />
          <path d="M60 48c4 5 4 12 0 17" />
          <path d="M66 44c6 7 6 18 0 25" />
        </g>
        <text
          x="49"
          y="80"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="10"
          fill={INK}
        >
          sicr3p/
        </text>
      </svg>
    );
  }
  if (kind === "charm") {
    return (
      <svg viewBox="0 0 120 90" className="h-20 w-auto" aria-hidden="true">
        <defs>
          <radialGradient id="pearl" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".35" stopColor="#ffd3e1" />
            <stop offset="1" stopColor="#e889ad" />
          </radialGradient>
          <radialGradient id="mint" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#c8ffe9" />
            <stop offset=".45" stopColor="#00b67a" />
            <stop offset="1" stopColor="#00563a" />
          </radialGradient>
        </defs>
        <path d="M60 2c-14 0-14 18 0 18s14-18 0-18" fill="none" stroke="#c9b37e" strokeWidth="3" />
        <path d="M60 20v14" stroke="#c9b37e" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="60" cy="38" r="5" fill="url(#pearl)" />
        <path d="M60 43v6" stroke="#c9b37e" strokeWidth="2" />
        <text
          x="41"
          y="80"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="34"
          fill={VIOLET}
        >
          3/
        </text>
        <circle cx="36" cy="64" r="7" fill="url(#pearl)" />
        <circle cx="86" cy="70" r="6" fill="url(#mint)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-auto" aria-hidden="true">
      <rect x="34" y="4" width="52" height="84" rx="12" fill={INK} />
      <circle cx="60" cy="50" r="22" fill={PINK} />
      <g fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round">
        <path d="M55 45c2 3 2 6 0 9" />
        <path d="M61 41c4 5 4 12 0 17" />
        <path d="M67 37c6 7 6 18 0 25" />
      </g>
      <circle cx="46" cy="16" r="5" fill="#1f2b55" />
    </svg>
  );
}
