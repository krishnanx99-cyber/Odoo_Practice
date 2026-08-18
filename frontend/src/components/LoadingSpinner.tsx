interface LoadingSpinnerProps {
  label?: string;
}

function LoadingSpinner({ label = "Loading…" }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-16"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-outline border-t-primary" />
      <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
    </div>
  );
}

export default LoadingSpinner;