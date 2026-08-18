import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-headline text-4xl font-extrabold uppercase">404</h1>
      <p className="text-on-surface-variant">This page does not exist.</p>
      <Link
        to="/"
        className="rounded-full border-2 border-on-background bg-primary px-6 py-2 font-bold text-on-primary shadow-[4px_4px_0_0_#1d1b20] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        Go home
      </Link>
    </div>
  );
}

export default NotFoundPage;