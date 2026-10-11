import { useState, type FormEvent } from "react";
import type { JourneyPath, Question } from "../../modules/journey-engine/types";
import { formatTaxId, validateAnswer } from "../../modules/identity/validation";
import { GuideBubble } from "../experience/GuideBubble";
import { PathTrail } from "../experience/PathTrail";

type Props = {
  path: JourneyPath;
  question: Question;
  index: number;
  total: number;
  initial: string;
  eventMode: boolean;
  onAnswer: (value: string) => void;
  onBack: () => void;
  onFillFictional: () => void;
};

/** Una pregunta por vez. El componente se remonta (key) en cada pregunta. */
export function Interview(props: Props) {
  const { path, question, index, total, initial, eventMode, onAnswer, onBack, onFillFictional } =
    props;
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function submit(next = value) {
    const problem = validateAnswer(question, next);
    setError(problem);
    if (!problem) onAnswer(next);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  const inputId = `jy-q-${question.id}`;
  const errorId = `${inputId}-error`;

  return (
    <section className="jy-panel" aria-labelledby={inputId + "-label"}>
      <PathTrail done={index} total={total} label="Identidad" />
      <GuideBubble path={path}>
        <span id={inputId + "-label"}>{question.prompt}</span>
      </GuideBubble>

      <form className="jy-form" onSubmit={onSubmit} noValidate>
        {question.kind === "choice" ? (
          <div className="jy-options" role="radiogroup" aria-labelledby={inputId + "-label"}>
            {question.options?.map((o, i) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                className="jy-option"
                autoFocus={i === 0 && !value}
                onClick={() => {
                  setValue(o.value);
                  submit(o.value);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        ) : question.kind === "consent" ? (
          <label className="jy-consent">
            <input
              id={inputId}
              type="checkbox"
              checked={value === "yes"}
              onChange={(e) => {
                setValue(e.target.checked ? "yes" : "");
                setError(null);
              }}
              aria-describedby={error ? errorId : undefined}
              autoFocus
            />
            <span>
              {question.label ?? question.prompt}
              {question.hint ? <small>{question.hint}</small> : null}
              {question.link ? (
                <a href={question.link.href} target="_blank" rel="noreferrer" className="jy-ref">
                  {question.link.text} ↗
                </a>
              ) : null}
            </span>
          </label>
        ) : (
          <input
            id={inputId}
            className="jy-input"
            type={question.kind === "email" ? "email" : question.kind === "phone" ? "tel" : "text"}
            inputMode={
              question.kind === "phone" ? "tel" : question.kind === "email" ? "email" : "text"
            }
            autoComplete={question.autoComplete}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => {
              setValue(question.kind === "taxId" ? formatTaxId(e.target.value) : e.target.value);
              setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            autoFocus
          />
        )}

        {error ? (
          <p id={errorId} className="jy-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="jy-actions">
          <button type="button" className="jy-btn jy-btn-ghost" onClick={onBack}>
            ← Atrás
          </button>
          {question.kind !== "choice" ? (
            <button type="submit" className="jy-btn jy-btn-primary">
              Continuar →
            </button>
          ) : null}
        </div>
      </form>

      {eventMode ? (
        <button type="button" className="jy-link" onClick={onFillFictional}>
          Completar con datos ficticios <span className="jy-badge">Simulado</span>
        </button>
      ) : null}
    </section>
  );
}
