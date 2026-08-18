import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-on-background font-bold uppercase tracking-wide transition-all " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] " +
  "active:translate-x-1 active:translate-y-1 active:shadow-none " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary shadow-[4px_4px_0_0_#1d1b20]",
  secondary: "bg-surface-container-highest text-on-surface shadow-[4px_4px_0_0_#1d1b20]",
  ghost: "bg-surface text-on-surface shadow-none hover:shadow-[4px_4px_0_0_#1d1b20]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;