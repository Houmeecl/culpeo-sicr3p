import type { JourneyPath, Question } from "../journey-engine/types";
import { COMPLIANCE_DECLARATION } from "../kyc/compliance";

export const ACTIVITY_OPTIONS = [
  { value: "restaurante", label: "Restaurante" },
  { value: "comercio", label: "Comercio" },
  { value: "servicios", label: "Servicios" },
  { value: "proveedor", label: "Proveedor" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "construccion", label: "Construcción" },
  { value: "transporte", label: "Transporte" },
  { value: "otra", label: "Otra actividad" },
];

const CONSENT: Question = {
  id: "consent",
  kind: "consent",
  prompt: "¿Aceptas el tratamiento de tus datos para continuar?",
  label: "Acepto el tratamiento de mis datos para continuar.",
  hint: "Los usamos sólo para tu incorporación a SICR3P/. Puedes retirarlo cuando quieras.",
  required: true,
};

export const QUESTIONS: Record<JourneyPath, Question[]> = {
  person: [
    {
      id: "fullName",
      kind: "text",
      prompt: "¡Hola! ¿Cómo te llamas?",
      placeholder: "Tu nombre",
      autoComplete: "name",
      required: true,
    },
    {
      id: "email",
      kind: "email",
      prompt: "¿Cuál es tu correo?",
      placeholder: "nombre@correo.cl",
      autoComplete: "email",
      required: true,
    },
    {
      id: "phone",
      kind: "phone",
      prompt: "¿Cuál es tu teléfono?",
      placeholder: "+56 9 1234 5678",
      autoComplete: "tel",
      required: true,
    },
    {
      id: "location",
      kind: "text",
      prompt: "¿Desde dónde participas?",
      placeholder: "Comuna o ciudad",
      autoComplete: "address-level2",
      required: true,
    },
    CONSENT,
  ],
  company: [
    {
      id: "companyName",
      kind: "text",
      prompt: "¿Cómo se llama tu empresa?",
      placeholder: "Nombre de la empresa",
      autoComplete: "organization",
      required: true,
    },
    {
      id: "taxId",
      kind: "taxId",
      prompt: "¿Cuál es su identificación tributaria?",
      placeholder: "RUT, ej. 76.123.456-0",
      required: true,
    },
    {
      id: "representative",
      kind: "text",
      prompt: "¿Quién la representa?",
      placeholder: "Nombre del representante",
      autoComplete: "name",
      required: true,
    },
    {
      id: "activity",
      kind: "choice",
      prompt: "¿Cuál es su actividad principal?",
      options: ACTIVITY_OPTIONS,
      required: true,
    },
    {
      id: "email",
      kind: "email",
      prompt: "¿A qué correo te escribimos?",
      placeholder: "contacto@empresa.cl",
      autoComplete: "email",
      required: true,
    },
    {
      id: "phone",
      kind: "phone",
      prompt: "¿Y un teléfono de contacto?",
      placeholder: "+56 9 1234 5678",
      autoComplete: "tel",
      required: true,
    },
    COMPLIANCE_DECLARATION,
    CONSENT,
  ],
};
