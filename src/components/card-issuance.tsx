import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDashed,
  Leaf,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { FieldShell, TextField } from "@/components/form-field";
import { AccessoriesPanel } from "@/components/accessories-panel";
import { CardStage } from "@/components/card-stage";
import { PayCard } from "@/components/pay-card";
import {
  ACTIVITIES,
  EMPTY_KYC,
  FUND_SOURCES,
  MONTHLY_VOLUME,
  assessRisk,
  issueCard,
  loadCardState,
  saveCardState,
  validateIdentity,
  validateProfile,
  type IssuedCard,
  type KycErrors,
  type KycForm,
  type AccessoryKind,
  type RiskAssessment,
  type WalletKind,
} from "@/lib/card-kyc";
import { formatRut, isValidRut } from "@/lib/rut";
import { cn } from "@/lib/utils";

const STEPS = ["Identidad", "Perfil", "Verificación", "Tarjeta"] as const;

const CHECKS = [
  "Documento de identidad y RUT",
  "Prueba de vida",
  "Listas de sanciones y PEP",
  "Revisión ESG de la actividad",
] as const;

const WALLETS: { kind: WalletKind; label: string }[] = [
  { kind: "apple", label: "Apple Wallet" },
  { kind: "google", label: "Google Wallet" },
];

function walletLabel(kind: WalletKind) {
  return WALLETS.find((w) => w.kind === kind)?.label ?? kind;
}

export function CardIssuance() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<KycForm>(EMPTY_KYC);
  const [errors, setErrors] = useState<KycErrors>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [card, setCard] = useState<IssuedCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [provisioning, setProvisioning] = useState<{ kind: WalletKind; code: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const saved = loadCardState();
    if (saved) {
      setCard(saved.card);
      setStep(3);
    }
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  function patch<K extends keyof KycForm>(key: K, value: KycForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function nextFromIdentity() {
    const found = validateIdentity(form, isValidRut);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(1);
  }

  function nextFromProfile() {
    const found = validateProfile(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  }

  function runVerification() {
    if (!consent) {
      setConsentError("Debes autorizar el tratamiento de tus datos para verificar tu identidad.");
      return;
    }
    setConsentError("");
    setRunning(true);
    setDone(0);
    CHECKS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(
          () => {
            setDone(i + 1);
            if (i === CHECKS.length - 1) {
              const result = assessRisk(form);
              setRisk(result);
              if (result.autoIssue) {
                const issued = issueCard(form.fullName);
                setCard(issued);
                saveCardState({ card: issued, level: result.level });
              }
              setRunning(false);
              setStep(3);
            }
          },
          650 * (i + 1),
        ),
      );
    });
  }

  function restart() {
    timers.current.forEach((t) => window.clearTimeout(t));
    saveCardState(null);
    setForm(EMPTY_KYC);
    setErrors({});
    setConsent(false);
    setDone(0);
    setRunning(false);
    setRisk(null);
    setCard(null);
    setFlipped(false);
    setProvisioning(null);
    setStep(0);
  }

  function startProvisioning(kind: WalletKind) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setProvisioning({ kind, code });
    setOtp("");
    setOtpError("");
  }

  function confirmProvisioning() {
    if (!provisioning || !card) return;
    if (otp.trim() !== provisioning.code) {
      setOtpError("El código no coincide. Revisa el SMS simulado.");
      return;
    }
    const next = {
      ...card,
      wallets: [...new Set([...card.wallets, provisioning.kind])],
    };
    setCard(next);
    saveCardState({ card: next, level: risk?.level ?? "bajo" });
    toast.success(`Tarjeta agregada a ${walletLabel(provisioning.kind)} (simulado)`);
    setProvisioning(null);
  }

  function orderAccessories(kinds: AccessoryKind[]) {
    if (!card) return;
    const next = { ...card, accessories: [...new Set([...(card.accessories ?? []), ...kinds])] };
    setCard(next);
    saveCardState({ card: next, level: risk?.level ?? "bajo" });
  }

  const inReview = step === 3 && !card && risk?.level === "alto";
  const holder = card?.holder || form.fullName;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-14">
      <div className="flex flex-col items-center gap-5 lg:sticky lg:top-24">
        <CardStage>
          <PayCard
            holder={holder}
            pan={card?.pan ?? null}
            expiry={card?.expiry ?? "••/••"}
            cvc={card?.cvc ?? null}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            status={card ? "issued" : inReview ? "review" : "preview"}
          />
        </CardStage>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-violet px-5 text-sm font-medium text-white transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          <RotateCcw className="size-4" />
          {flipped ? "Ver frente" : "Ver reverso"}
        </button>
        <p className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          Mueve el cursor sobre la tarjeta para ver el brillo, o tócala para girarla.
        </p>
      </div>

      <div className="min-w-0">
        <Stepper step={step} />
        <div className="mt-6 rounded-xl bg-paper-raised p-5 shadow-border sm:p-7">
          {step === 0 ? (
            <StepBlock
              title="Tus datos de identidad"
              hint="Los mismos datos que figuran en tu cédula. Son la base de la debida diligencia (KYC)."
            >
              <TextField
                label="Nombre completo"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => patch("fullName", e.target.value)}
                error={errors.fullName}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="RUT"
                  name="rut"
                  inputMode="text"
                  placeholder="12.345.678-5"
                  value={form.rut}
                  onChange={(e) => patch("rut", formatRut(e.target.value))}
                  error={errors.rut}
                />
                <TextField
                  label="Fecha de nacimiento"
                  name="birthDate"
                  type="date"
                  autoComplete="bday"
                  value={form.birthDate}
                  onChange={(e) => patch("birthDate", e.target.value)}
                  error={errors.birthDate}
                />
              </div>
              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => patch("email", e.target.value)}
                error={errors.email}
              />
              <Nav onNext={nextFromIdentity} />
            </StepBlock>
          ) : null}

          {step === 1 ? (
            <StepBlock
              title="Perfil de riesgo"
              hint="Con esto calculamos el nivel de diligencia: simplificada, estándar o reforzada."
            >
              <SelectBox
                label="Origen de tus fondos"
                name="fundSource"
                value={form.fundSource}
                error={errors.fundSource}
                onChange={(v) => patch("fundSource", v)}
                options={FUND_SOURCES}
              />
              <SelectBox
                label="Actividad principal"
                name="activity"
                value={form.activity}
                error={errors.activity}
                onChange={(v) => patch("activity", v)}
                options={ACTIVITIES}
              />
              <SelectBox
                label="Movimiento mensual estimado"
                name="volume"
                value={form.volume}
                error={errors.volume}
                onChange={(v) => patch("volume", v)}
                options={MONTHLY_VOLUME}
              />
              <label className="flex items-start gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.pep}
                  onChange={(e) => patch("pep", e.target.checked)}
                  className="mt-0.5 size-4 accent-violet"
                />
                <span>Soy una persona expuesta políticamente (PEP) o familiar directo de una.</span>
              </label>
              <Nav onBack={() => setStep(0)} onNext={nextFromProfile} />
            </StepBlock>
          ) : null}

          {step === 2 ? (
            <StepBlock
              title="Verificación de identidad"
              hint="Simulamos las cuatro revisiones que haría un proveedor KYC. No se usa tu cámara ni se envían datos a terceros."
            >
              <ul className="flex flex-col gap-2.5">
                {CHECKS.map((label, i) => {
                  const state = i < done ? "ok" : running && i === done ? "run" : "wait";
                  return (
                    <li key={label} className="flex items-center gap-3 text-sm text-ink">
                      {state === "ok" ? (
                        <BadgeCheck className="size-5 text-success" />
                      ) : state === "run" ? (
                        <Loader2 className="size-5 animate-spin text-violet" />
                      ) : (
                        <CircleDashed className="size-5 text-ink-soft/60" />
                      )}
                      <span className={cn(state === "wait" && "text-ink-soft")}>{label}</span>
                    </li>
                  );
                })}
              </ul>
              <label className="flex items-start gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setConsentError("");
                  }}
                  className="mt-0.5 size-4 accent-violet"
                />
                <span>
                  Autorizo el tratamiento de mis datos personales para verificar mi identidad y
                  evaluar mi perfil de riesgo.
                </span>
              </label>
              {consentError ? (
                <p className="text-xs text-danger" role="alert">
                  {consentError}
                </p>
              ) : null}
              <Nav
                onBack={running ? undefined : () => setStep(1)}
                nextLabel={running ? "Verificando…" : "Verificar y emitir"}
                onNext={runVerification}
                disabled={running}
              />
            </StepBlock>
          ) : null}

          {step === 3 && card && risk ? <RiskSummary risk={risk} /> : null}

          {step === 3 && card ? (
            <WalletPanel
              card={card}
              provisioning={provisioning}
              otp={otp}
              otpError={otpError}
              onOtp={(v) => {
                setOtp(v.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
              }}
              onStart={startProvisioning}
              onConfirm={confirmProvisioning}
              onCancel={() => setProvisioning(null)}
            />
          ) : null}

          {step === 3 && card ? (
            <>
              <AccessoriesPanel ordered={card.accessories ?? []} onOrder={orderAccessories} />
              <button
                type="button"
                onClick={restart}
                className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-full px-1 text-sm font-medium text-ink-soft underline-offset-4 hover:text-navy hover:underline"
              >
                <RotateCcw className="size-4" />
                Borrar demo y empezar de nuevo
              </button>
            </>
          ) : null}

          {inReview && risk ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-6 shrink-0 text-sun" />
                <div>
                  <h2 className="font-display text-xl font-semibold text-navy">
                    Tu solicitud pasa a revisión manual
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Tu perfil requiere diligencia reforzada (EDD). Un oficial de cumplimiento debe
                    aprobarla antes de emitir la tarjeta. Mientras tanto, no se genera ningún
                    número.
                  </p>
                </div>
              </div>
              <RiskSummary risk={risk} />
              <button
                type="button"
                onClick={restart}
                className="inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-sm font-medium text-navy ring-1 ring-line transition-transform duration-150 active:scale-[0.96]"
              >
                <RotateCcw className="size-4" />
                Empezar de nuevo
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Demostración: la verificación, el puntaje de riesgo y el alta en wallet se simulan en tu
          navegador. La tarjeta emitida no funciona en redes de pago ni se envía información a
          ningún emisor.
        </p>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3" aria-label="Progreso">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2 sm:gap-3">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
              i < step && "bg-success text-white",
              i === step && "bg-violet text-white",
              i > step && "bg-sand text-ink-soft",
            )}
            aria-current={i === step ? "step" : undefined}
          >
            {i < step ? "✓" : i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === step ? "text-navy" : "text-ink-soft")}>
            {label}
          </span>
          {i < STEPS.length - 1 ? <span className="h-px w-4 bg-line sm:w-8" /> : null}
        </li>
      ))}
    </ol>
  );
}

function StepBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextLabel = "Continuar",
  disabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink-soft transition-transform duration-150 active:scale-[0.96]"
        >
          <ArrowLeft className="size-4" />
          Atrás
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-violet px-5 text-sm font-medium text-white transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-60"
      >
        {nextLabel}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function SelectBox({
  label,
  name,
  value,
  error,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <FieldShell label={label} name={name} error={error}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 rounded-md bg-paper px-3 text-sm text-ink outline-none ring-1 ring-line transition-[box-shadow] duration-150 focus:ring-2 focus:ring-violet/40",
          error && "ring-danger/50",
        )}
      >
        <option value="" disabled>
          Selecciona
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

const LEVEL_STYLE = {
  bajo: "bg-success/10 text-success",
  medio: "bg-sun/20 text-ink",
  alto: "bg-danger/10 text-danger",
} as const;

function RiskSummary({ risk }: { risk: RiskAssessment }) {
  return (
    <div className="rounded-lg bg-paper p-4 ring-1 ring-line">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <ShieldCheck className="size-5 text-violet" />
        <span className="font-medium text-navy">Resultado KYC</span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            LEVEL_STYLE[risk.level],
          )}
        >
          Riesgo {risk.level}
        </span>
        <span className="text-ink-soft">· Diligencia {risk.diligence}</span>
      </div>
      {risk.reasons.length ? (
        <ul className="mt-3 flex flex-col gap-1 text-xs text-ink-soft">
          {risk.reasons.map((r) => (
            <li key={r} className="flex items-center gap-2">
              {r.startsWith("Revisión ESG") ? (
                <Leaf className="size-3.5 text-success" />
              ) : (
                <span className="size-1.5 rounded-full bg-ink-soft/50" />
              )}
              {r}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-ink-soft">Sin factores de riesgo adicionales.</p>
      )}
    </div>
  );
}

function WalletPanel({
  card,
  provisioning,
  otp,
  otpError,
  onOtp,
  onStart,
  onConfirm,
  onCancel,
}: {
  card: IssuedCard;
  provisioning: { kind: WalletKind; code: string } | null;
  otp: string;
  otpError: string;
  onOtp: (value: string) => void;
  onStart: (kind: WalletKind) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy">
          ¡Tu tarjeta está lista, {card.holder.split(" ")[0]}!
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Agrégala a tu wallet para pagar con el teléfono. Gira la tarjeta para ver el número y el
          CVC.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {WALLETS.map(({ kind, label }) => {
          const added = card.wallets.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              disabled={added || provisioning !== null}
              onClick={() => onStart(kind)}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.96] disabled:active:scale-100",
                added
                  ? "bg-success/10 text-success"
                  : "bg-navy-deep text-paper disabled:opacity-60",
              )}
            >
              {added ? <BadgeCheck className="size-4" /> : <Wallet className="size-4" />}
              {added ? `En ${label}` : `Agregar a ${label}`}
            </button>
          );
        })}
      </div>

      {provisioning ? (
        <div
          className="rounded-lg bg-violet-soft p-4 ring-1 ring-violet/20"
          role="group"
          aria-label="Verificación de wallet"
        >
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 size-5 shrink-0 text-violet" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">
                Confirma el alta en {walletLabel(provisioning.kind)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Un emisor real enviaría un SMS. En la demostración, el código es{" "}
                <strong className="font-mono text-sm text-violet-deep">{provisioning.code}</strong>.
              </p>
              <div className="mt-3 flex flex-wrap items-start gap-2">
                <div className="flex flex-col gap-1">
                  <input
                    aria-label="Código de verificación"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => onOtp(e.target.value)}
                    placeholder="000000"
                    className="h-11 w-36 rounded-md bg-paper-raised px-3 font-mono text-base tracking-[0.3em] text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-violet/40"
                  />
                  {otpError ? (
                    <p className="text-xs text-danger" role="alert">
                      {otpError}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="h-11 rounded-full bg-violet px-5 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.96]"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-11 rounded-full px-4 text-sm font-medium text-ink-soft"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
