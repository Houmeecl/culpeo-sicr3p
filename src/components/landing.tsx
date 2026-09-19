import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Compass,
  Handshake,
  Scale,
  Shield,
} from "lucide-react";
import { Landscape } from "@/components/landscape";
import { SiteShell } from "@/components/site-shell";
import { VoiceAgent } from "@/components/voice-agent";
import { COMMUNES, MEMBERSHIP_CLP, formatClp } from "@/lib/region";

const PILLARS = [
  {
    title: "Permanencia",
    body: "No es una campaña. Las capacidades se construyen en años, no en un ciclo presupuestario.",
  },
  {
    title: "Gobernanza",
    body: "Dirección con actores públicos, privados, académicos y territoriales. No de un solo interés.",
  },
  {
    title: "Neutralidad",
    body: "No representamos a un comprador ni a un proveedor. El criterio es técnico y verificable.",
  },
  {
    title: "Método",
    body: "Diagnóstico antes de la oferta. Ruta por etapas. Umbrales objetivos para avanzar de nivel.",
  },
  {
    title: "Medición",
    body: "Lo que se afirma se mide. Lo que se mide se publica de forma agregada y anónima.",
  },
  {
    title: "Territorio",
    body: "Presencia en las comunas donde operan las empresas, no solo en la capital regional.",
  },
];

const LEVELS = [
  {
    name: "Inicial",
    range: "IR menor a 30%",
    body: "Punto de partida. La empresa existe formalmente y ya inició su diagnóstico.",
  },
  {
    name: "En desarrollo",
    range: "IR 30% a 50%",
    body: "Retiene una parte creciente. Certificación en curso y 12 horas de Academia.",
  },
  {
    name: "Preparado",
    range: "IR 50% a 70%",
    body: "Retiene la mayoría de lo que factura y compra a otros proveedores regionales.",
  },
  {
    name: "De conexión",
    range: "IR sobre 70%",
    body: "Motor de encadenamiento. Auditoría externa. Pocos lo alcanzan; eso es intencional.",
  },
];

const INCLUDED = [
  "Diagnóstico empresarial y financiero",
  "Ejecutivo de desarrollo asignado",
  "Índice de Retención Regional",
  "Identidad digital en PDF",
  "Academia Proveedor Regional",
  "Orientación en financiamiento y protección",
];

export function Landing() {
  return (
    <SiteShell current="home">
      <main>
        <Hero />
        <Stats />
        <WhatWeAre />
        <Levels />
        <Membership />
        <Territory />
        <Lead />
      </main>
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-center lg:gap-12 lg:pb-4 lg:pt-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            Fundación territorial · Antofagasta
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl">
            Tu empresa, preparada para crecer en su territorio.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Proveedor Regional no es un portal de contacto. Es una institución
            que diagnostica, forma, acompaña y mide el valor que realmente
            permanece en la Región de Antofagasta.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/incorporar"
              className="inline-flex h-12 items-center rounded-full bg-navy px-5 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Incorporar empresa
            </Link>
            <a
              href="#hablar"
              className="inline-flex h-12 items-center rounded-full bg-paper-raised px-5 text-sm font-medium text-navy shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              Conversar ahora
            </a>
          </div>
        </div>
        <VoiceAgent />
      </div>
      <Landscape className="mt-4 h-36 sm:h-44" scene="port" />
    </section>
  );
}

function Stats() {
  const items = [
    { value: "US$2.650 M", label: "gasto minero anual en proveedores de la región" },
    { value: "4 de 5", label: "barreras son de acceso, no de capacidad técnica" },
    { value: formatClp(MEMBERSHIP_CLP), label: "membresía mensual, igual para toda empresa" },
    { value: "9 comunas", label: "desde Taltal hasta Ollagüe" },
  ];
  return (
    <section className="border-y border-line bg-paper-raised">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.value}>
            <p className="font-display text-2xl font-semibold tabular-nums text-navy">
              {item.value}
            </p>
            <p className="mt-1 text-sm leading-snug text-ink-soft">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhatWeAre() {
  return (
    <section id="institucion" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
        01 · Qué somos
      </p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Una institución, no una plataforma.
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Una plataforma conecta transacciones y su valor termina cuando la
        transacción ocurre. Una institución construye capacidades, sostiene el
        proceso y responde por sus resultados ante el territorio.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-xl bg-paper-raised p-5 shadow-[var(--shadow-border)]"
          >
            <h3 className="font-display text-lg font-semibold text-navy">
              {pillar.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {pillar.body}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Fact
          icon={Compass}
          title="Diagnóstico primero"
          body="No ofrecemos productos por defecto. Definimos la ruta según la realidad de cada empresa."
        />
        <Fact
          icon={Handshake}
          title="Ejecutivo asignado"
          body="Coordina especialistas, financiamiento, protección y la Academia. No reemplaza a tu contador: los articula."
        />
        <Fact
          icon={Scale}
          title="Neutralidad verificable"
          body="No cobramos comisión por contratos ni garantizamos adjudicaciones. La confianza es la condición de trabajo."
        />
      </div>
    </section>
  );
}

function Fact({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Compass;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-paper p-4">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-sand text-navy">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="font-display font-semibold text-navy">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}

function Levels() {
  return (
    <section id="niveles" className="scroll-mt-20 bg-navy text-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sun">
          02 · Un nivel se demuestra
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Del gasto local al valor que queda en la región.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/75">
          Comprarle a un intermediario con domicilio regional cuenta como compra
          local y, aun así, el valor puede salir del territorio. El Índice de
          Retención mide lo que permanece: salarios, compras de segundo nivel y
          utilidades reinvertidas.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((level, index) => (
            <article
              key={level.name}
              className="rounded-xl bg-navy-deep/60 p-5 ring-1 ring-paper/10"
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sun">
                0{index + 1}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold">
                {level.name}
              </h3>
              <p className="mt-1 text-sm text-sand">{level.range}</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/75">
                {level.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-paper/65">
          El IR es condición necesaria, no suficiente. También se evalúan
          cumplimiento, certificación y formación. Ningún perfil se otorga por
          antigüedad ni por el valor de la membresía.
        </p>
      </div>
    </section>
  );
}

function Membership() {
  return (
    <section id="membresia" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            03 · Membresía
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Una sola membresía. Todo el programa.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            No hay categorías de precio. Todas las empresas de la red acceden al
            mismo acompañamiento. El perfil de desarrollo se gana con evidencia.
          </p>
          <ul className="mt-8 space-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-copper" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-2xl bg-paper-raised p-6 shadow-[var(--shadow-border)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Valor mensual
          </p>
          <p className="mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight text-navy">
            {formatClp(MEMBERSHIP_CLP)}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Pagadero por adelantado. Fijo durante el primer año. Sin cobro
            automático de renovación.
          </p>
          <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm text-ink-soft">
            <p className="flex gap-2">
              <Shield className="size-4 shrink-0 text-navy" />
              No incluye crédito, pólizas ni adjudicación de contratos.
            </p>
            <p className="flex gap-2">
              <BookOpen className="size-4 shrink-0 text-navy" />
              Tras el pago se agenda el diagnóstico inicial con el ejecutivo.
            </p>
            <p className="flex gap-2">
              <Building2 className="size-4 shrink-0 text-navy" />
              Una membresía por empresa, para toda la ruta.
            </p>
          </div>
          <Link
            to="/incorporar"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-navy text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Solicitar incorporación
          </Link>
        </aside>
      </div>
    </section>
  );
}

function Territory() {
  return (
    <section className="relative overflow-hidden bg-sand/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          04 · Territorio
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          La identidad regional es identidad.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Toda empresa que opera en Antofagasta opera en un territorio con
          historia, lengua y pueblos anteriores a la industria. El desarrollo
          que no incluye a quienes han estado siempre aquí no es desarrollo
          regional: es solo crecimiento económico con domicilio en la región.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {COMMUNES.map((commune) => (
            <li
              key={commune}
              className="rounded-full bg-paper-raised px-3.5 py-1.5 text-sm text-navy shadow-[var(--shadow-border)]"
            >
              {commune}
            </li>
          ))}
        </ul>
      </div>
      <Landscape className="h-32 sm:h-40" scene="desert" />
    </section>
  );
}

function Lead() {
  return (
    <section id="incorporar" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="rounded-2xl bg-paper-raised p-6 shadow-[var(--shadow-border)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
          Cómo opera
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy">
          Capturar datos. Cobrar el primer mes. Agendar diagnóstico.
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Datos de la empresa",
              body: "Razón social, RUT, comuna, giro y contacto autorizado. Quedan en el tablero institucional.",
            },
            {
              n: "02",
              title: "Pago de $120.000",
              body: "Primer mes por adelantado. Tarjeta o transferencia. Se emite folio de membresía.",
            },
            {
              n: "03",
              title: "Diagnóstico",
              body: "El ejecutivo asignado agenda. Recién ahí se recomienda la ruta, no antes.",
            },
          ].map((step) => (
            <li key={step.n} className="rounded-xl bg-paper p-5 ring-1 ring-line">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                {step.n}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/incorporar"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Incorporar ahora
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/tablero"
            className="inline-flex h-12 items-center rounded-full bg-paper px-5 text-sm font-medium text-navy shadow-[var(--shadow-border)]"
          >
            Ver tablero
          </Link>
        </div>
      </div>
    </section>
  );
}
