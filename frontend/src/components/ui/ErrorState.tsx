import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-on-background bg-error-container px-6 py-12 text-center">
      <p className="font-headline text-2xl font-bold text-on-error-container">{title}</p>
      <p className="max-w-md text-on-error-container/80">{message}</p>
      {onRetry ? (
        <div className="mt-2">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ErrorState;