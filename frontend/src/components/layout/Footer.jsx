import { Link } from "react-router-dom";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/", label: "Home" },
      { to: "/bookstore", label: "Bookstore" },
      { to: "/library", label: "Library" },
      { to: "/learning", label: "Learning" },
      { to: "/kids-universe", label: "Kids Universe" },
      { to: "/meditation-corner", label: "Meditations" },
      { to: "/reach-out", label: "Reach Out" },
    ],
  },
  {
    title: "Trust",
    links: [
      { to: "/about", label: "About" },
      { to: "/legal", label: "Legal · Responsibility" },
      { to: "/legal#refund-policy", label: "Refund policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/portal", label: "User Portal" },
      { to: "/portal", label: "Sign In" },
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
            <div className="flex items-center gap-2.5 mb-6">
              <span className="relative inline-block w-6 h-6">
                <span className="absolute inset-0 rounded-full border border-[hsl(var(--aurin-sage))] opacity-70" />
                <span className="absolute inset-[5px] rounded-full bg-[hsl(var(--aurin-sage))]" />
              </span>
              <span className="aurin-display text-[19px]">
                Matrix{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  Aurin
                </span>
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-sm">
              A structured digital home for self-mastery, reflection, and guided
              learning. The published face of <strong className="text-[hsl(var(--aurin-text))]">prulesoul.site</strong>.
              Designed to move slowly, on purpose.
            </p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[hsl(var(--aurin-text-muted))]">
          <div data-testid="footer-copy">
            © {new Date().getFullYear()} prulesoul.site · Matrix Aurin. Quiet by design.
          </div>
          <div className="flex items-center gap-5">
            <span>Structured</span>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--aurin-border))]" />
            <span>Calm</span>
            <span className="w-1 h-1 rounded-full bg-[hsl(var(--aurin-border))]" />
            <span>Guided</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
