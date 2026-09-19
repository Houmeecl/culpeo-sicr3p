const EMPRESA_RE = /[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ .,&/-]/g;

export function clipEmpresa(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(EMPRESA_RE, "").trim().slice(0, 80);
}

export function parseAgentSearch(search: Record<string, unknown>): {
  empresa?: string;
} {
  const empresa = clipEmpresa(search.empresa);
  return empresa ? { empresa } : {};
}
