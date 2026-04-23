import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", testid: "nav-home" },
  { to: "/library", label: "Library", testid: "nav-library" },
  { to: "/kids-universe", label: "Kids Universe", testid: "nav-kids" },
  {
    to: "/meditation-corner",
    label: "Meditation Corner",
    testid: "nav-meditation",
  },
  { to: "/portal", label: "User Portal", testid: "nav-portal" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-[hsl(var(--aurin-bg))/0.85] backdrop-blur-xl border-b border-[hsl(var(--aurin-border-soft))]"
          : "bg-transparent"
      }`}
      style={
        scrolled
          ? { backgroundColor: "hsla(140, 12%, 6%, 0.82)" }
          : undefined
      }
    >
      <div className="aurin-container flex items-center justify-between h-[72px]">
        <Link
          to="/"
          data-testid="brand-logo"
          className="flex items-center gap-2.5 group"
        >
          <span className="relative inline-block w-6 h-6">
            <span className="absolute inset-0 rounded-full border border-[hsl(var(--aurin-sage))] opacity-70" />
            <span className="absolute inset-[5px] rounded-full bg-[hsl(var(--aurin-sage))]" />
          </span>
          <span className="aurin-display text-[19px] tracking-tight">
            Matrix <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">Aurin</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9" data-testid="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              data-testid={item.testid}
              className={({ isActive }) =>
                `aurin-link text-[13.5px] tracking-wide ${
                  isActive ? "" : "text-[hsl(var(--aurin-text))/0.82]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/portal"
            data-testid="nav-cta-enter"
            className="aurin-btn aurin-btn-ghost"
          >
            Enter Portal
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-menu"
          className="lg:hidden border-t border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg))]"
        >
          <div className="aurin-container py-6 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                data-testid={`${item.testid}-mobile`}
                className={({ isActive }) =>
                  `text-base py-2 border-b border-[hsl(var(--aurin-border-soft))] ${
                    isActive
                      ? "text-[hsl(var(--aurin-sage))]"
                      : "text-[hsl(var(--aurin-text))]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/portal"
              className="aurin-btn aurin-btn-ghost mt-2 self-start"
              data-testid="nav-cta-enter-mobile"
            >
              Enter Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
