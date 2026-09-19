import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
};

export function FieldShell({ label, name, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-navy">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className, id, name, ...props }: InputProps) {
  const fieldId = id ?? name;
  return (
    <FieldShell label={label} name={fieldId ?? "field"} error={error}>
      <input
        id={fieldId}
        name={name}
        className={cn(
          "h-11 rounded-md bg-paper px-3 text-sm text-ink outline-none ring-1 ring-line transition-[box-shadow] duration-150 focus:ring-2 focus:ring-navy/30",
          error && "ring-danger/50 focus:ring-danger/40",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  placeholder?: string;
  options: readonly string[];
};

export function SelectField({
  label,
  error,
  placeholder = "Selecciona",
  options,
  className,
  id,
  name,
  ...props
}: SelectProps) {
  const fieldId = id ?? name;
  return (
    <FieldShell label={label} name={fieldId ?? "field"} error={error}>
      <select
        id={fieldId}
        name={name}
        className={cn(
          "h-11 rounded-md bg-paper px-3 text-sm text-ink outline-none ring-1 ring-line transition-[box-shadow] duration-150 focus:ring-2 focus:ring-navy/30",
          error && "ring-danger/50 focus:ring-danger/40",
          className,
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
