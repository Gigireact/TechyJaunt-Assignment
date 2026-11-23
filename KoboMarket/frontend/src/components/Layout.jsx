import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Button } from "./ui";

export default function Layout() {
  const { user, logout, has } = useAuth(),
    nav = useNavigate(),
    [open, setOpen] = useState(false),
    [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user) return;
    const f = () =>
      api("/notifications/unread-count")
        .then((d) => setUnread(d.count ?? d))
        .catch(() => {});
    f();
    const t = setInterval(f, 30000);
    return () => clearInterval(t);
  }, [user]);
  console.log("Logged-in user:", user);
console.log("User roles:", user?.roles);
console.log("Is admin:", has("admin"));
  const links = [
    ["/", "Shop"],
    ...(user
      ? [
          ["/cart", "Cart"],
          ["/orders", "Orders"],
          ["/wallet", "Wallet"],
        ]
      : []),
    ...(user && true ? [["/vendor", "Sell"]] : []),
    ...(has("admin") ? [["/admin", "Admin"]] : []),
  ];
  const cls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5"}`;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="font-display text-xl font-extrabold">
            <span className="text-kobo-500">Kobo</span>Market
          </Link>
          <nav className="ml-6 hidden gap-1 md:flex">
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} end={to === "/"} className={cls}>
                {l}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative rounded-lg p-2 hover:bg-ink/5"
                  aria-label="Notifications"
                >
                  🔔
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 rounded-full bg-saffron px-1.5 text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </Link>
                <span className="hidden text-sm text-ink/70 sm:block">
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await logout();
                    nav("/login");
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 text-sm font-semibold">
                  Log in
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
            <button
              className="rounded-lg p-2 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>
        {open && (
          <nav
            className="flex flex-col gap-1 border-t border-ink/10 p-3 md:hidden"
            onClick={() => setOpen(false)}
          >
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} end={to === "/"} className={cls}>
                {l}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
