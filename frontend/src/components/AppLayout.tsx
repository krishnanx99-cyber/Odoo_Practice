import { Link, NavLink, Outlet } from "react-router-dom";
import { isAuthenticated, setSessionUser } from "../lib/auth";

function AppLayout() {
  const authed = isAuthenticated();

  const handleLogout = () => {
    setSessionUser(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-on-surface">
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b-2 border-on-background bg-surface px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:px-10">
        <Link to="/" className="font-headline text-2xl font-bold text-on-surface">
          CampusConnect
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full border-2 border-on-background px-4 py-1 text-sm font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                isActive ? "bg-secondary-container text-on-secondary-container" : ""
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `rounded-full px-4 py-1 text-sm font-bold text-on-surface-variant transition-all hover:text-on-surface hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                isActive ? "bg-secondary-container text-on-secondary-container" : ""
              }`
            }
          >
            My Bookings
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          {authed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border-2 border-on-background bg-surface-container-highest px-4 py-2 text-sm font-bold text-on-surface shadow-[4px_4px_0_0_#1d1b20] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border-2 border-on-background bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-[4px_4px_0_0_#1d1b20] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-grow flex-col px-4 py-12 md:px-10">
        <Outlet />
      </main>

      <footer className="flex w-full flex-col items-center justify-between gap-4 border-t-2 border-on-background bg-surface-container px-4 py-6 md:flex-row md:px-10">
        <span className="font-headline text-lg font-bold text-on-surface">
          © 2026 University CampusConnect. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default AppLayout;