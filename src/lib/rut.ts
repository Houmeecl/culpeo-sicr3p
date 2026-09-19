const RUT_BODY = /^[0-9]{7,8}$/;

export function cleanRut(value: string) {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function isValidRut(value: string) {
  const clean = cleanRut(value);
  if (clean.length < 8 || clean.length > 9) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!RUT_BODY.test(body)) return false;

  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);
  return dv === expected;
}

export function formatRut(value: string) {
  const clean = cleanRut(value);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped}-${dv}`;
}
