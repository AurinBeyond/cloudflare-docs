import { Link } from "react-router-dom";
import SocialLinks from "@/components/SocialLinks";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/", label: "Home" },
      { to: "/library", label: "Library" },
      { to: "/bookstore", label: "Bookstore" },
      { to: "/pricing", label: "Pricing" },
      { to: "/about", label: "About" },
      { to: "/reach-out", label: "Contact" },
    ],
  },
  {
    title: "Trust",
    links: [
      { to: "/wanderers-agreement", label: "Wanderer's Agreement" },
      { to: "/legal#privacy", label: "Privacy & GDPR" },
      { to: "/legal#terms", label: "Terms of service" },
      { to: "/legal#refunds", label: "Refund policy" },
      { to: "/legal#cookies", label: "Cookies" },
      { to: "/legal#accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/portal", label: "Sign In" },
      { to: "/account", label: "Your data (GDPR)" },
      { to: "/pricing", label: "Manage subscription" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="relative z-[2] border-t border-[hsl(var(--aurin-border-soft))] mt-16"
    >
      <div className="aurin-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6" data-testid="footer-brand">
              <img
                src="/assets/brand/prulesoul-logo.png"
                alt="prulesoul"
                data-testid="footer-brand-logo"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-[hsl(var(--aurin-sage))/0.5]"
              />
              <span className="aurin-display text-[19px] leading-none flex flex-col">
                <span>prulesoul</span>
                <span className="text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-sage))/0.85] mt-1">
                  Matrix · <span className="aurin-serif-italic normal-case tracking-normal">Aurin</span>
                </span>
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-sm" style={{ fontStyle: "italic", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              The published face of <strong className="text-[hsl(var(--aurin-text))] not-italic">prulesoul.site</strong>.
              A house with rooms — built to be read slowly, on purpose.
            </p>
            <div className="mt-6" data-testid="footer-social">
              <SocialLinks testidPrefix="footer-social" />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-3">
              <div className="aurin-eyebrow mb-5">{col.title}</div>
              <ul className="space-y-3">
                {col.links.map((l, i) => (
                  <li key={`${col.title}-${i}`}>
                    <Link
                      to={l.to}
                      data-testid={`footer-link-${col.title.toLowerCase()}-${i}`}
                      className="text-[14.5px] text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1 md:text-right">
            <div className="aurin-eyebrow mb-5 md:justify-end">v.0.1</div>
            <div className="text-xs text-[hsl(var(--aurin-text-muted))]">
              Est. 2026
            </div>
          </div>
        </div>

        <div className="aurin-hairline mt-14 mb-6" />
        <div
          data-testid="footer-privacy-luxury"
          className="text-[12px] text-[hsl(var(--aurin-text-muted))] mb-6 max-w-[68ch]"
        >
          No social-media pixels. No tracking cookies. No public feed. Your
          journey through this work stays yours — that is part of the design.
        </div>
        {/* §FROM-ANNA 2026-06-26 — The only discreet door to the
            upstairs study. Intentionally small, unaccompanied by a
            column heading, and placed below the privacy line so the
            curious eye can find it without it being announced. */}
        <div className="mb-8">
          <Link
            to="/from-anna"
            data-testid="footer-from-anna-link"
            aria-label="A letter from upstairs — read what Anna has written"
            className="text-[12px] italic tracking-wide text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
          >
            A letter from upstairs
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[hsl(var(--aurin-text-muted))]">
          <div data-testid="footer-copy">
            © {new Date().getFullYear()} prulesoul.site · Matrix Aurin. Quiet by design.
          </div>
          <div className="flex items-center gap-5">
            <span>Quiet</span>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--aurin-border))]" />
            <span>Calm</span>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--aurin-border))]" />
            <span>Yours</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
