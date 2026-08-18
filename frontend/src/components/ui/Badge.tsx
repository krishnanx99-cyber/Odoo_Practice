import type { HTMLAttributes } from "react";

type BadgeTone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container text-on-surface",
};

function Badge({ tone = "secondary", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-on-background px-3 py-1 text-xs font-bold uppercase tracking-wider ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;