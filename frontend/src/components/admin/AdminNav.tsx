import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/resources", label: "Resources" },
  { to: "/admin/events", label: "Events" },
];

function AdminNav() {
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap gap-2 rounded-[1rem] border-2 border-on-background bg-surface-container-lowest p-2 shadow-[4px_4px_0_0_#1d1b20]"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `rounded-full border-2 border-on-background px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#1d1b20] active:translate-x-0 active:translate-y-0 active:shadow-none ${
              isActive
                ? "bg-primary text-on-primary shadow-[3px_3px_0_0_#1d1b20]"
                : "bg-surface text-on-surface"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminNav;