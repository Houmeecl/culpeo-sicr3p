/** Indicador de avance: baldosas de la ruta que se iluminan (no es una barra). */
export function PathTrail({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div
      className="jy-trail"
      role="img"
      aria-label={`${label}: paso ${Math.min(done + 1, total)} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="jy-trail-tile"
          data-state={i < done ? "done" : i === done ? "current" : "todo"}
        />
      ))}
      <span className="jy-trail-label">
        {label} · {Math.min(done + 1, total)}/{total}
      </span>
    </div>
  );
}
