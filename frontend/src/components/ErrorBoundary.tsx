import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error caught by ErrorBoundary:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            Something went wrong
          </h1>
          <p className="max-w-md text-on-surface-variant">
            An unexpected error occurred. Try refreshing the page, and if the
            problem persists, contact support.
          </p>
          <button
            type="button"
            className="rounded-full border-2 border-on-background bg-primary px-6 py-2 font-bold text-on-primary shadow-[4px_4px_0_0_#1d1b20] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;