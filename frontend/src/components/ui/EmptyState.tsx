import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-16 text-center">
      <p className="font-headline text-2xl font-bold text-on-surface">{title}</p>
      {description ? (
        <p className="max-w-md text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default EmptyState;