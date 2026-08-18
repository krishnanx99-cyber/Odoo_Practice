import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

function Card({ children, interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface-container-lowest shadow-[8px_8px_0_0_#1d1b20] transition-all ${
        interactive
          ? "cursor-pointer hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;