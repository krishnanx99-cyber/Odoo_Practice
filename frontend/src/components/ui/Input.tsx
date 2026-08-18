import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-bold text-on-surface">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all ${
          error ? "border-error" : ""
        } ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}
    </div>
  );
}

export default Input;