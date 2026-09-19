import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  Landmark,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { SelectField, TextField } from "@/components/form-field";
import {
  payApplication,
  submitApplication,
  type Application,
  type ApplicationInput,
  type PaymentMethod,
} from "@/lib/applications";
import {
  COMMUNES,
  MEMBERSHIP_CLP,
  ROLES,
  SECTORS,
  WORKFORCE,
  formatClp,
} from "@/lib/region";
import { formatRut, isValidRut } from "@/lib/rut";
import { cn } from "@/lib/utils";

const STEPS = ["Empresa", "Contacto", "Pago"] as const;

const EMPTY: ApplicationInput = {
  companyName: "",
  rut: "",
  sector: "",
  commune: "",
  workers: "",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
};

export function IncorporarFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicationInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationInput, string>>>({});
  const [contract, setContract] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [regional, setRegional] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("tarjeta");
  const [busy, setBusy] = useState(false);

  function patch<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateCompany() {
    const next: Partial<Record<keyof ApplicationInput, string>> = {};
    if (form.companyName.trim().length < 3) next.companyName = "Indica la razón social.";
    if (!isValidRut(form.rut)) next.rut = "El RUT no es válido.";
    if (!form.sector) next.sector = "Selecciona un giro.";
    if (!form.commune) next.commune = "Selecciona una comuna.";
    if (!form.workers) next.workers = "Indica el tamaño.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateContact() {
    const next: Partial<Record<keyof ApplicationInput, string>> = {};
    if (form.contactName.trim().length < 3) next.contactName = "Indica el nombre de contacto.";
    if (!form.contactRole) next.contactRole = "Selecciona el cargo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "El correo no es válido.";
    }
    if (form.phone.replace(/\D/g, "").length < 8) next.phone = "Indica un teléfono.";
    setErrors(next);
    if (!contract || !privacy || !regional) {
      setConsentError("Debes aceptar las tres declaraciones para continuar.");
      return false;
    }
    setConsentError("");
    return Object.keys(next).length === 0;
  }

  async function goNext() {
    if (step === 0) {
      if (!validateCompany()) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!validateContact()) return;
      setBusy(true);
      try {
        const created = await submitApplication({ data: form });
        setApplication(created);
        setStep(2);
        toast.success("Solicitud capturada. Ahora el primer mes.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo registrar.");
      } finally {
        setBusy(false);
      }
    }
  }

  async function completePayment() {
    if (!application) return;
    setBusy(true);
    try {
      const paid = await payApplication({
        data: { folio: application.folio, method },
      });
      toast.success("Pago registrado. Membresía activada.");
      await navigate({ to: "/comprobante/$folio", params: { folio: paid.folio } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el pago.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="rounded-2xl bg-paper-raised p-5 shadow-[var(--shadow-border)] sm:p-8">
        <ol className="mb-8 grid grid-cols-3 gap-2">
          {STEPS.map((label, index) => (
            <li key={label} className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.16em]",
                  index === step ? "text-copper" : "text-ink-soft",
                )}
              >
                0{index + 1}
              </p>
              <p
                className={cn(
                  "mt-1 truncate text-sm",
                  index === step ? "font-medium text-navy" : "text-ink-soft",
                )}
              >
                {label}
              </p>
              <span
                className={cn(
                  "mt-2 block h-0.5 rounded-full",
                  index <= step ? "bg-navy" : "bg-line",
                )}
              />
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Razón social"
                name="companyName"
                value={form.companyName}
                onChange={(event) => patch("companyName", event.target.value)}
                error={errors.companyName}
                required
                autoComplete="organization"
              />
            </div>
            <TextField
              label="RUT de la empresa"
              name="rut"
              value={form.rut}
              onChange={(event) => patch("rut", event.target.value)}
              onBlur={() => {
                if (form.rut) patch("rut", formatRut(form.rut));
              }}
              error={errors.rut}
              placeholder="76.123.456-K"
              required
            />
            <SelectField
              label="Giro"
              name="sector"
              value={form.sector}
              onChange={(event) => patch("sector", event.target.value)}
              options={SECTORS}
              error={errors.sector}
              required
            />
            <SelectField
              label="Comuna"
              name="commune"
              value={form.commune}
              onChange={(event) => patch("commune", event.target.value)}
              options={COMMUNES}
              error={errors.commune}
              required
            />
            <SelectField
              label="Trabajadores"
              name="workers"
              value={form.workers}
              onChange={(event) => patch("workers", event.target.value)}
              options={WORKFORCE}
              error={errors.workers}
              required
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nombre de contacto"
              name="contactName"
              value={form.contactName}
              onChange={(event) => patch("contactName", event.target.value)}
              error={errors.contactName}
              required
              autoComplete="name"
            />
            <SelectField
              label="Cargo"
              name="contactRole"
              value={form.contactRole}
              onChange={(event) => patch("contactRole", event.target.value)}
              options={ROLES}
              error={errors.contactRole}
              required
            />
            <TextField
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => patch("email", event.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />
            <TextField
              label="Teléfono"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => patch("phone", event.target.value)}
              error={errors.phone}
              placeholder="+56 9 1234 5678"
              required
              autoComplete="tel"
            />
            <fieldset className="sm:col-span-2 mt-2 space-y-3 rounded-xl bg-paper p-4 ring-1 ring-line">
              <legend className="px-1 text-sm font-medium text-navy">
                Declaraciones
              </legend>
              <CheckLine
                checked={contract}
                onChange={setContract}
                label="Acepto suscribir el Contrato de Adhesión de Proveedor Regional."
              />
              <CheckLine
                checked={privacy}
                onChange={setPrivacy}
                label="Autorizo el tratamiento de estos datos para diagnóstico, membresía y contacto del ejecutivo asignado (Ley 19.628)."
              />
              <CheckLine
                checked={regional}
                onChange={setRegional}
                label="Declaro que la casa matriz está en la Región de Antofagasta, o que la operación que incorporamos está instalada en el territorio."
              />
              {consentError ? (
                <p className="text-xs text-danger" role="alert">
                  {consentError}
                </p>
              ) : null}
            </fieldset>
          </div>
        ) : null}

        {step === 2 && application ? (
          <PaymentStep
            application={application}
            method={method}
            onMethod={setMethod}
            busy={busy}
            onPay={completePayment}
          />
        ) : null}

        {step < 2 ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-paper px-5 text-sm font-medium text-navy shadow-[var(--shadow-border)]"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              disabled={busy}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-medium text-paper transition-transform duration-150 ease-out enabled:active:scale-[0.96] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {step === 0 ? "Continuar" : "Registrar solicitud"}
            </button>
          </div>
        ) : null}
      </div>

      <aside className="rounded-2xl bg-navy p-6 text-paper shadow-[var(--shadow-border)] lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sun">
          Membresía
        </p>
        <p className="mt-2 font-display text-4xl font-semibold tabular-nums">
          {formatClp(MEMBERSHIP_CLP)}
        </p>
        <p className="mt-2 text-sm text-paper/70">
          Primer mes, por adelantado. Igual para toda empresa. Fijo el primer año.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-paper/80">
          {[
            "Diagnóstico empresarial inicial",
            "Ejecutivo de desarrollo asignado",
            "Índice de Retención Regional",
            "Identidad digital en PDF",
            "Academia Proveedor Regional",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-sun" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 flex gap-2 text-xs leading-relaxed text-paper/55">
          <Shield className="size-3.5 shrink-0" />
          No incluye crédito, pólizas ni adjudicación de contratos. El perfil de desarrollo no se compra: se demuestra.
        </p>
      </aside>
    </div>
  );
}

function CheckLine({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-navy"
      />
      <span>{label}</span>
    </label>
  );
}

function PaymentStep({
  application,
  method,
  onMethod,
  busy,
  onPay,
}: {
  application: Application;
  method: PaymentMethod;
  onMethod: (value: PaymentMethod) => void;
  busy: boolean;
  onPay: () => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink-soft">
        Solicitud {application.folio} registrada. El siguiente paso es el pago
        del primer mes para activar el diagnóstico.
      </p>
      <dl className="mt-5 grid gap-3 rounded-xl bg-paper p-4 text-sm ring-1 ring-line sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Empresa</dt>
          <dd className="mt-1 font-medium text-navy">{application.companyName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">RUT</dt>
          <dd className="mt-1 font-medium text-navy">{application.rut}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Comuna</dt>
          <dd className="mt-1 font-medium text-navy">{application.commune}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">A pagar</dt>
          <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-navy">
            {formatClp(application.amountClp)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MethodCard
          active={method === "tarjeta"}
          onClick={() => onMethod("tarjeta")}
          icon={CreditCard}
          title="Tarjeta"
          body="Débito o crédito. En operación se cobra por Transbank."
        />
        <MethodCard
          active={method === "transferencia"}
          onClick={() => onMethod("transferencia")}
          icon={Landmark}
          title="Transferencia"
          body="Registramos el primer mes a la cuenta de la fundación."
        />
      </div>

      {method === "transferencia" ? (
        <div className="mt-4 rounded-xl bg-sand/60 p-4 text-sm text-ink">
          <p className="font-medium text-navy">Datos para transferencia</p>
          <p className="mt-2 text-ink-soft">
            En producción se informan cuenta, banco y RUT de la fundación. Aquí
            el registro deja la solicitud pagada en el tablero para activar el
            ejecutivo.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          Esta vista registra el cobro en el tablero institucional. No se
          almacenan números de tarjeta.
        </p>
      )}

      <button
        type="button"
        onClick={onPay}
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy text-sm font-medium text-paper transition-transform duration-150 ease-out enabled:active:scale-[0.96] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />}
        Pagar {formatClp(MEMBERSHIP_CLP)}
      </button>
    </div>
  );
}

function MethodCard({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CreditCard;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl p-4 text-left transition-[box-shadow,background-color] duration-150",
        active
          ? "bg-sand shadow-[var(--shadow-border-hover)]"
          : "bg-paper ring-1 ring-line hover:shadow-[var(--shadow-border)]",
      )}
    >
      <Icon className="size-5 text-navy" />
      <p className="mt-2 font-display font-semibold text-navy">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{body}</p>
    </button>
  );
}
