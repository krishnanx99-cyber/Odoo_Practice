import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-bold text-on-surface">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`w-full appearance-none rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all ${
          error ? "border-error" : ""
        } ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}
    </div>
  );
}

export default Select;