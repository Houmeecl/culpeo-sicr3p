# app/completion

Escenas finales del recorrido (fase F3 del plan en `docs/journey/SICR3P-Journey.md`):

- `Activation.tsx` — activación única de $19.990 CLP (`modules/subscription/activation.ts`),
  vía `PaymentProvider` (simulado en modo evento).
- `Result.tsx` — resultado empresa (activa / en revisión) o persona (tarjeta preparada),
  con capacidades "Próximamente" y QR de continuación en modo evento.

Aún no implementadas en el prototipo.
