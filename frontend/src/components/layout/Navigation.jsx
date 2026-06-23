import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", testid: "nav-home" },
  { to: "/six-nights", label: "Six Nights", testid: "nav-six-nights" },
  { to: "/the-beginning", label: "The Beginning", testid: "nav-the-beginning" },
  { to: "/grace", label: "Grace", testid: "nav-grace" },
  { to: "/body-world", label: "Body World", testid: "nav-body-room" },
  { to: "/parents-room", label: "Parents' Room", testid: "nav-parents-room" },
  { to: "/kids-universe/polarstar", label: "Polarstar Kids", testid: "nav-kids-universe" },
  { to: "/alistair", label: "Alistair", testid: "nav-alistair" },
  { to: "/aurin-philosophy", label: "Philosophy", testid: "nav-aurin-philosophy" },
  { to: "/library", label: "Library", testid: "nav-library" },
  { to: "/bookstore", label: "Bookstore", testid: "nav-bookstore" },
  { to: "/about", label: "Origin", testid: "nav-origin" },
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

  /* §NAV-CLOSE 2026-02-08 — Previously this component closed the mobile
     menu via a useEffect watching location.pathname, but that pattern
     trips Emergent's react-hooks/set-state-in-effect rule (a blocker
     in the lint stage). The eslint-disable directive cannot be used
     because the rule is internal and adding it crashes the build with
     "rule not found". The correct refactor is to close the menu at
     the source of the navigation itself — every NavLink + the Enter
     Portal CTA calls closeMenu() on click. No state-in-effect needed. */
  const closeMenu = () => setOpen(false);

  const inGraceContext = location.pathname.startsWith("/grace");
  const inAlistairContext = location.pathname.startsWith("/course-room") || location.pathname.startsWith("/alistair");

  /* §HIDE-ON-LAB-PAGES 2026-02-10 — Founder success criterion: the
     global header MUST be hidden on individual lab pages
     (/course-room/lab/{slug}) so the painted Polarstar pattern reads
     edge-to-edge. The hub /course-room and other Alistair sub-pages
     keep their filtered top-bar. */
  const isLabPage = location.pathname.startsWith("/course-room/lab/") || location.pathname.startsWith("/alistair/lab/");
  if (isLabPage) return null;

  /* §FULL-HIDE-REVERT 2026-02-08 — The full hide introduced earlier in
     this session has been reverted. Founder clarified: she did not
     ask for a system-wide top-bar change; she was talking about
     navigation INSIDE Alistair (between its 11 themes). The original
     pre-session behaviour is restored: on /grace* and /course-room*
     the shared top-bar stays visible but FILTERED to its anchor links
     (Home + current room + Enter Portal). */
  const visibleItems =
    inGraceContext
      ? NAV_ITEMS.filter((i) => i.to === "/" || i.to === "/grace")
      : inAlistairContext
      ? NAV_ITEMS.filter((i) => i.to === "/" || i.to === "/alistair")
      : NAV_ITEMS;

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
      <div className="aurin-container flex items-center justify-between h-[72px] gap-4">
        <Link
          to="/"
          data-testid="brand-logo"
          className="flex items-center gap-3 group flex-shrink-0 min-w-0"
          aria-label="prulesoul · Matrix Aurin home"
        >
          <img
            src="/assets/brand/prulesoul-logo.png"
            alt="prulesoul"
            data-testid="brand-logo-image"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-[hsl(var(--aurin-sage))/0.5] group-hover:ring-[hsl(var(--aurin-sage))] transition-all flex-shrink-0"
          />
          <span className="aurin-display text-[18px] tracking-tight leading-none flex flex-col whitespace-nowrap">
            <span className="text-[hsl(var(--aurin-text))]">prulesoul</span>
            <span className="text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-sage))/0.85] mt-1">
              Matrix · <span className="aurin-serif-italic normal-case tracking-normal">Aurin</span>
            </span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 flex-nowrap" data-testid="desktop-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              data-testid={item.testid}
              onClick={closeMenu}
              className={({ isActive }) =>
                `aurin-link text-[13.5px] tracking-wide whitespace-nowrap ${
                  isActive ? "" : "text-[hsl(var(--aurin-text))/0.82]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
          <Link
            to="/portal"
            data-testid="nav-cta-enter"
            onClick={closeMenu}
            className="aurin-btn aurin-btn-ghost whitespace-nowrap"
          >
            Enter Portal
          </Link>
        </div>

        <button
          className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))] flex-shrink-0"
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
          className="xl:hidden border-t border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg))]"
        >
          <div className="aurin-container py-6 flex flex-col gap-4">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                data-testid={`${item.testid}-mobile`}
                onClick={closeMenu}
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
              onClick={closeMenu}
            >
              Enter Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
