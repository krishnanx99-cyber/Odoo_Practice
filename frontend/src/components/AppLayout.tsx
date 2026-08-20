import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const navLinkClasses = (isActive: boolean) =>
  `rounded-full px-4 py-1 text-sm font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none ${
    isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:text-on-surface"
  }`;

function AppLayout() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    void signOut();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-on-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:border-2 focus:border-on-background focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-on-primary focus:shadow-[4px_4px_0_0_#1d1b20]"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b-2 border-on-background bg-surface px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:px-10">
        <Link to="/" className="font-headline text-2xl font-bold text-on-surface">
          CampusConnect
        </Link>
        <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
          <NavLink to="/" className={({ isActive }) => navLinkClasses(isActive)}>
            Home
          </NavLink>
          <NavLink to="/my-bookings" className={({ isActive }) => navLinkClasses(isActive)}>
            My Bookings
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink to="/admin/bookings" className={({ isActive }) => navLinkClasses(isActive)}>
              Admin
            </NavLink>
          ) : null}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-bold text-on-surface-variant sm:block">
            {user?.fullName}
          </span>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            className="rounded-full border-2 border-on-background bg-surface-container-highest p-2 text-on-surface transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <span className="hidden md:block">
            {user ? (
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
          </span>
        </div>
      </header>

      {mobileMenuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="flex flex-col gap-3 border-b-2 border-on-background bg-surface px-6 py-4 md:hidden"
        >
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => navLinkClasses(isActive)}>
            Home
          </NavLink>
          <NavLink to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => navLinkClasses(isActive)}>
            My Bookings
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => navLinkClasses(isActive)}>
              Admin
            </NavLink>
          ) : null}
          <div className="pt-2">
            {user ? (
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
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border-2 border-on-background bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-[4px_4px_0_0_#1d1b20] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      ) : null}

      <main id="main-content" className="mx-auto flex w-full max-w-[1280px] flex-grow flex-col px-4 py-12 md:px-10">
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