import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { groupPan } from "@/lib/card-kyc";

const W = 432;
const H = 685;

const INK = "#0F1B3D";
const SUB = "#4A3F6B";
const ACCENT = "#6B5CF6";
const FONT = "'Inter', system-ui, sans-serif";

export type PayCardProps = {
  holder: string;
  /** PAN completo, o null para mostrarlo oculto (vista previa). */
  pan: string | null;
  expiry: string;
  cvc: string | null;
  flipped: boolean;
  onFlip: () => void;
  status: "preview" | "issued" | "review";
};

function qrCells() {
  const n = 21;
  const cells: boolean[] = [];
  let s = 11;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const finders = [
    [0, 0],
    [0, 14],
    [14, 0],
  ];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      let f: 0 | 1 | null = null;
      for (const [fr, fc] of finders) {
        const y = r - fr;
        const x = c - fc;
        if (y >= 0 && y < 7 && x >= 0 && x < 7) {
          const edge = y === 0 || y === 6 || x === 0 || x === 6;
          const core = y >= 2 && y <= 4 && x >= 2 && x <= 4;
          f = edge || core ? 1 : 0;
          break;
        }
        if (y >= -1 && y < 8 && x >= -1 && x < 8) {
          f = 0;
          break;
        }
      }
      cells.push(f === null ? rnd() > 0.5 : f === 1);
    }
  }
  return cells;
}

const labelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 2.6,
  fontWeight: 600,
  color: SUB,
};

export function PayCard({ holder, pan, expiry, cvc, flipped, onFlip, status }: PayCardProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 30 });
  const qr = useMemo(qrCells, []);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ ry: (px - 0.5) * 26, rx: (0.5 - py) * 18, gx: px * 100, gy: py * 100 });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 30 });
  }

  const shownPan = pan ? groupPan(pan) : "•••• •••• •••• ••••";
  const name = holder.trim() || "Nombre del titular";
  const statusLabel =
    status === "issued" ? "Virtual · activa" : status === "review" ? "En revisión" : "Vista previa";

  return (
    <div
      ref={frame}
      className="pay-card-frame"
      style={{ width: "100%", maxWidth: 360, aspectRatio: `${W} / ${H}`, perspective: 1500 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="pay-card-bob" style={{ width: "100%", height: "100%" }}>
        <div
          style={{
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              width: W,
              height: H,
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
              transition: "transform 0.25s ease-out",
            }}
          >
            <button
              type="button"
              onClick={onFlip}
              aria-label={flipped ? "Ver frente de la tarjeta" : "Ver reverso de la tarjeta"}
              className="pay-card-flip"
              style={{
                all: "unset",
                display: "block",
                position: "relative",
                width: W,
                height: H,
                cursor: "pointer",
                transformStyle: "preserve-3d",
                transform: `rotateY(${flipped ? 180 : 0}deg)`,
                transition: "transform 1s cubic-bezier(.7,-0.2,.25,1.2)",
              }}
            >
              {/* FRENTE */}
              <div className="pay-card-face" style={{ color: INK, fontFamily: FONT }}>
                <div className="pay-card-iri" aria-hidden="true" />
                <div
                  className="pay-card-foil"
                  aria-hidden="true"
                  style={{ backgroundPosition: `${tilt.gx}% ${tilt.gy}%` }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -200,
                    bottom: -230,
                    width: 470,
                    height: 470,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.26)",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -80,
                    bottom: -320,
                    width: 430,
                    height: 430,
                    borderRadius: "50%",
                    background: "rgba(107,92,246,0.16)",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: -160,
                    top: -240,
                    width: 420,
                    height: 420,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.55)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    height: H,
                    boxSizing: "border-box",
                    padding: "46px 40px 40px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <svg width="74" height="58" viewBox="0 0 74 58" aria-hidden="true">
                      <defs>
                        <linearGradient id="chipF" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#fff6e0" />
                          <stop offset="0.5" stopColor="#d9c5a0" />
                          <stop offset="1" stopColor="#f3e6c8" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="1"
                        y="1"
                        width="72"
                        height="56"
                        rx="10"
                        fill="url(#chipF)"
                        stroke="#a08a5e"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M1 20h22M1 38h22M51 20h22M51 38h22M23 1v56M51 1v56M23 29h28"
                        stroke="#a08a5e"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                    <svg
                      width="34"
                      height="42"
                      viewBox="0 0 34 42"
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path className="pay-card-wave w1" d="M6 15c3 4 3 8 0 12" />
                      <path className="pay-card-wave w2" d="M15 9c6 7 6 17 0 24" />
                      <path className="pay-card-wave w3" d="M24 3c9 10 9 26 0 36" />
                    </svg>
                  </div>
                  <div
                    style={{
                      marginTop: 88,
                      fontWeight: 800,
                      fontSize: 86,
                      letterSpacing: -4,
                      lineHeight: 1,
                    }}
                  >
                    sicr<span style={{ color: ACCENT }}>3</span>p
                    <span style={{ color: ACCENT }}>/</span>
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      fontSize: 19,
                      fontWeight: 600,
                      letterSpacing: -0.3,
                      lineHeight: 1.25,
                    }}
                  >
                    <span style={{ width: 2, height: 46, background: ACCENT, borderRadius: 2 }} />
                    <span>
                      Desarrollamos empresas.
                      <br />
                      Acercamos soluciones.
                    </span>
                  </div>
                  <div
                    style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span style={labelStyle}>NOMBRE DEL TITULAR</span>
                    <span
                      style={{
                        fontSize: 25,
                        fontWeight: 600,
                        letterSpacing: -0.3,
                        maxWidth: 350,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </span>
                  </div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={labelStyle}>VÁLIDA HASTA</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22 }}>
                      {expiry}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 22,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 20px",
                        borderRadius: 999,
                        border: `1.5px solid ${ACCENT}`,
                        fontSize: 17,
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{ width: 12, height: 12, borderRadius: "50%", background: ACCENT }}
                      />
                      {statusLabel}
                    </span>
                    <span
                      style={{
                        width: 108,
                        height: 64,
                        borderRadius: 10,
                        border: `1.5px dashed ${SUB}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        fontSize: 10,
                        lineHeight: 1.3,
                        letterSpacing: 1.6,
                        fontWeight: 600,
                        color: SUB,
                      }}
                    >
                      DEMO
                      <br />
                      SIN RED
                    </span>
                  </div>
                </div>
                <div className="pay-card-sheen" aria-hidden="true" />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.26), rgba(255,255,255,0) 45%)`,
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* REVERSO */}
              <div
                className="pay-card-face"
                style={{ color: INK, fontFamily: FONT, transform: "rotateY(180deg)" }}
              >
                <div className="pay-card-iri" aria-hidden="true" />
                <div
                  className="pay-card-foil"
                  aria-hidden="true"
                  style={{ backgroundPosition: `${100 - tilt.gx}% ${tilt.gy}%` }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -200,
                    bottom: -230,
                    width: 470,
                    height: 470,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.26)",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -80,
                    bottom: -320,
                    width: 430,
                    height: 430,
                    borderRadius: "50%",
                    background: "rgba(107,92,246,0.16)",
                  }}
                />
                <div
                  className="pay-card-gloss"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 44,
                    top: 0,
                    width: 102,
                    height: H,
                    backgroundColor: "#0F1B3D",
                    boxShadow:
                      "inset 2px 0 0 rgba(255,255,255,0.12), inset -2px 0 0 rgba(0,0,0,0.35)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 158,
                    width: 44,
                    height: H,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      display: "flex",
                      alignItems: "center",
                      gap: 26,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 24,
                        fontWeight: 500,
                        letterSpacing: 3,
                        whiteSpace: "nowrap",
                        textShadow: "0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 rgba(15,27,61,0.3)",
                      }}
                    >
                      {shownPan}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: 8, letterSpacing: 2, fontWeight: 600, color: SUB }}>
                        VÁLIDA HASTA
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15 }}>
                        {expiry}
                      </span>
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: H,
                    boxSizing: "border-box",
                    padding: "30px 26px 26px 214px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.8 }}>
                        sicr<span style={{ color: ACCENT }}>3</span>p
                        <span style={{ color: ACCENT }}>/</span>
                      </span>
                    </div>
                    <span style={{ fontSize: 8, letterSpacing: 2.2, fontWeight: 600, color: SUB }}>
                      SOPORTADA
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                      style={{ display: "flex", height: 44, borderRadius: 4, overflow: "hidden" }}
                    >
                      <div
                        style={{
                          flex: "1 1 auto",
                          background:
                            "repeating-linear-gradient(135deg, #FFFFFF 0px, #FFFFFF 5px, #F1EEFF 5px, #F1EEFF 10px)",
                        }}
                      />
                      <div
                        style={{
                          width: 60,
                          background: "#FFFFFF",
                          color: "#0F1B3D",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          borderLeft: "1px solid #DDD8F5",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            letterSpacing: 1.5,
                            fontWeight: 600,
                            color: "#4A3F6B",
                          }}
                        >
                          CVC
                        </span>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 18,
                            fontWeight: 500,
                          }}
                        >
                          {cvc ?? "•••"}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 7.5, letterSpacing: 0.8, color: SUB }}>
                      FIRMA AUTORIZADA · NO VÁLIDA SIN FIRMA
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ background: "#FFFFFF", padding: 5, borderRadius: 6 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(21, 3px)",
                          gridAutoRows: 3,
                        }}
                      >
                        {qr.map((on, i) => (
                          <div key={i} style={{ background: on ? "#0F1B3D" : "transparent" }} />
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, lineHeight: 1.4, color: "#2c2950" }}>
                      Código ilustrativo. Tarjeta de demostración, no válida en redes de pago.
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={INK}
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 2l9 5-9 5-9-5 9-5z" />
                      <path d="M3 7v10l9 5V12" />
                      <path d="M21 7v10l-9 5" />
                    </svg>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        letterSpacing: -0.3,
                        lineHeight: 1.05,
                      }}
                    >
                      Proveedor
                      <br />
                      Regional
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5 }}>
                    <ContactRow
                      icon="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"
                      circle
                      text="proveedorregional.cl"
                    />
                  </div>
                  <div
                    style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}
                  >
                    <div
                      className="pay-card-holo"
                      style={{
                        width: 52,
                        height: 34,
                        flex: "0 0 auto",
                        borderRadius: 6,
                        background:
                          "conic-gradient(from 30deg, #ff9ccb, #b9a8ff, #ffe1a8, #9fe8cf, #ff9ccb)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7)",
                      }}
                    />
                    <span style={{ fontSize: 8, lineHeight: 1.45, color: "#2c2950" }}>
                      Tarjeta soportada por sicr3p/, una iniciativa de Proveedor Regional. Uso
                      sujeto a términos y condiciones.
                    </span>
                  </div>
                </div>
                <div className="pay-card-sheen" aria-hidden="true" />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at ${100 - tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.24), rgba(255,255,255,0) 45%)`,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  text,
  circle,
  rect,
}: {
  icon: string;
  text: string;
  circle?: boolean;
  rect?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.8"
        aria-hidden="true"
      >
        {circle ? <circle cx="12" cy="12" r="9" /> : null}
        {rect ? <rect x="3" y="5" width="18" height="14" rx="2" /> : null}
        <path d={icon} />
      </svg>
      <span>{text}</span>
    </div>
  );
}
