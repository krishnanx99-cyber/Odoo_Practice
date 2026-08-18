import type { ReactNode } from "react";

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

function Tab({ active = false, onClick, children }: TabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-2 border-on-background px-6 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
        active
          ? "bg-primary text-on-primary shadow-[4px_4px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
          : "bg-surface text-on-surface hover:bg-surface-container hover:shadow-[4px_4px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
      }`}
    >
      {children}
    </button>
  );
}

export default Tab;