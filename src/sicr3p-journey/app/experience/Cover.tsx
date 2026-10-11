export function Cover({ onStart }: { onStart: () => void }) {
  return (
    <section className="jy-cover" aria-labelledby="jy-cover-title">
      <h1 id="jy-cover-title" className="jy-wordmark">
        sicr<span className="jy-accent">3</span>p<span className="jy-accent">/</span>
      </h1>
      <p className="jy-cover-tagline">Todo comienza con una conexión.</p>
      <button type="button" className="jy-btn jy-btn-primary jy-btn-lg" onClick={onStart} autoFocus>
        Comenzar recorrido
        <span className="jy-btn-arrow" aria-hidden="true">
          →
        </span>
      </button>
      <ul className="jy-cover-tags" aria-label="Una red">
        <li>Empresas</li>
        <li>Personas</li>
        <li>Territorios</li>
      </ul>
    </section>
  );
}
