import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";

/**
 * Admin Preview Assets — a single founder-only page that lays out
 * every visual asset on the platform side-by-side, so quality can be
 * audited at a glance:
 *
 *   - 8 Body Room hotspot images (Nano Banana, sage-on-black)
 *   - All daily Coloring Studio pages
 *   - All book covers (PDF first-page extracts) + direct PDF links
 *
 * Not linked from main nav. Reached via /admin/preview-assets.
 */

const BODY_ROOM_SLUGS = [
  "crown-overthinker",
  "throat-unspoken",
  "heart-compass",
  "solar-plexus-control",
  "belly-intuition",
  "hips-archive",
  "hands-boundary",
  "feet-roots",
];

export default function AdminPreviewAssets() {
  const [coloring, setColoring] = useState([]);
  const [books, setBooks] = useState([]);
  const [audit, setAudit] = useState(null);
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem("aurin_admin_token") || "";
    } catch {
      return "";
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // If ?token=... arrives, persist it once.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = (params.get("token") || "").trim();
    if (t && t !== adminToken) {
      setAdminToken(t);
      try {
        localStorage.setItem("aurin_admin_token", t);
      } catch {
        /* ignore */
      }
    }
  }, [adminToken]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const calls = [
          api.get("/coloring/pages"),
          api.get("/books"),
        ];
        if (adminToken) {
          calls.push(api.get(`/admin/site-audit?token=${encodeURIComponent(adminToken)}`));
        }
        const results = await Promise.allSettled(calls);
        if (!alive) return;
        const c = results[0].status === "fulfilled" ? results[0].value : null;
        const b = results[1].status === "fulfilled" ? results[1].value : null;
        const a = results[2] && results[2].status === "fulfilled" ? results[2].value : null;
        setColoring((c && c.data && c.data.pages) || []);
        setBooks((b && b.data) || []);
        setAudit((a && a.data) || null);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refreshKey, adminToken]);

  return (
    <div data-testid="page-admin-preview" className="min-h-screen">
      <div className="aurin-container pt-10 pb-8 flex items-center justify-between gap-4">
        <Link to="/" className="aurin-btn aurin-btn-ghost" data-testid="admin-preview-home">
          <ArrowLeft size={13} /> Home
        </Link>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="aurin-btn aurin-btn-ghost"
          data-testid="admin-preview-refresh"
        >
          <RefreshCw size={13} /> Reload from API
        </button>
      </div>

      <header className="aurin-container pb-10">
        <div className="aurin-eyebrow mb-2">Admin · Asset preview</div>
        <h1 className="aurin-display text-4xl md:text-5xl leading-[1.05]">
          Every image,{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            in one place.
          </span>
        </h1>
        <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] mt-3 max-w-[60ch]">
          A founder-only audit grid. Every image you see here is being
          served from the live backend right now. If a tile appears blank,
          that file is genuinely missing — open the browser DevTools
          Network tab and you&apos;ll see the 404.
        </p>
      </header>

      {/* Health audit panel — only renders when admin token is supplied */}
      {audit && audit.summary && (
        <section className="aurin-container mb-10" data-testid="admin-preview-health">
          <div className="aurin-card p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="aurin-display text-xl md:text-2xl">System Audit</h2>
              <span className="text-[11px] font-mono text-[hsl(var(--aurin-text-muted))]">
                checked {new Date(audit.summary.checked_at).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              <HealthCell
                label="Books · PDFs"
                ok={audit.summary.books_pdf_present}
                total={audit.summary.books_total}
              />
              <HealthCell
                label="Books · Covers"
                ok={audit.summary.books_cover_present}
                total={audit.summary.books_total}
              />
              <HealthCell
                label="Body Room"
                ok={audit.summary.body_room_present}
                total={audit.summary.body_room_total}
              />
              <HealthCell
                label="Coloring (today)"
                ok={audit.summary.coloring_present}
                total={audit.summary.coloring_total}
              />
            </div>
          </div>
        </section>
      )}

      {!audit && (
        <section className="aurin-container mb-10">
          <div className="aurin-card p-6 text-[13px] text-[hsl(var(--aurin-text-muted))]">
            <strong className="text-[hsl(var(--aurin-text))]">
              Want a numeric system audit?
            </strong>{" "}
            Add <code className="aurin-serif-italic">?token=ADMIN_TOKEN</code>{" "}
            to this page&apos;s URL once. The token will be remembered in
            this browser only. Find ADMIN_TOKEN in{" "}
            <code>/app/backend/.env</code>.
          </div>
        </section>
      )}

      {/* Body Room — 8 hotspot images */}
      <section className="aurin-container mb-16" data-testid="admin-preview-body-room">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="aurin-display text-2xl md:text-3xl">Body Room — 8 hotspots</h2>
          <span className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
            sage-on-black graphic-novel · Nano Banana
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BODY_ROOM_SLUGS.map((slug) => (
            <a
              key={slug}
              href={`/api/body-room/image/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`admin-preview-body-${slug}`}
              className="aurin-card overflow-hidden group hover:border-[hsl(var(--aurin-sage)_/_0.55)] transition-colors"
            >
              <div className="aspect-square bg-black overflow-hidden">
                <img
                  src={`/api/body-room/image/${slug}`}
                  alt={slug}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2 text-[12px] flex items-center justify-between">
                <span className="font-mono">{slug}</span>
                <ExternalLink size={11} className="text-[hsl(var(--aurin-text-muted))]" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Coloring Studio */}
      <section className="aurin-container mb-16" data-testid="admin-preview-coloring">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="aurin-display text-2xl md:text-3xl">
            Coloring Studio — daily pages
          </h2>
          <span className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
            {loading ? "loading…" : `${coloring.length} live`}
          </span>
        </div>
        {!loading && coloring.length === 0 && (
          <div className="aurin-card p-6 text-[13px] text-[hsl(var(--aurin-text-muted))]">
            No coloring pages returned by /api/coloring/pages. The daily
            generator runs at boot and every 24h — admin trigger:
            <code className="block mt-2 text-[12px]">
              POST /api/coloring/generate-daily?token=ADMIN_TOKEN
            </code>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {coloring.map((p) => (
            <a
              key={p.slug}
              href={p.image_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`admin-preview-coloring-${p.slug}`}
              className="aurin-card overflow-hidden group"
            >
              <div className="bg-white p-3">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2 text-[12px]">
                <div className="font-medium">{p.title}</div>
                <div className="text-[hsl(var(--aurin-text-muted))]">
                  age {p.age_group} · {p.date}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Books */}
      <section className="aurin-container mb-20" data-testid="admin-preview-books">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="aurin-display text-2xl md:text-3xl">Bookstore — covers + PDFs</h2>
          <span className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
            {loading ? "loading…" : `${books.length} books`}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((b) => (
            <div
              key={b.slug}
              className="aurin-card overflow-hidden"
              data-testid={`admin-preview-book-${b.slug}`}
            >
              <a
                href={b.cover_image_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[3/4] bg-black overflow-hidden"
              >
                {b.cover_image_url ? (
                  <img
                    src={b.cover_image_url}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-[12px] text-[hsl(var(--aurin-text-muted))]">
                    no cover
                  </div>
                )}
              </a>
              <div className="px-3 py-3 text-[12px] space-y-2">
                <div className="font-medium leading-snug">{b.title}</div>
                <div className="text-[hsl(var(--aurin-text-muted))]">
                  {b.price === 0 ? "Free · lead magnet" : `$${b.price}`} ·{" "}
                  {b.audience}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to={`/bookstore/${b.slug}`}
                    className="text-[hsl(var(--aurin-sage))] hover:underline"
                  >
                    page
                  </Link>
                  {b.pdf_url && (
                    <a
                      href={b.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[hsl(var(--aurin-sage))] hover:underline"
                    >
                      pdf
                    </a>
                  )}
                  {b.cover_image_url && (
                    <a
                      href={b.cover_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[hsl(var(--aurin-sage))] hover:underline"
                    >
                      cover
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HealthCell({ label, ok, total }) {
  const allGreen = ok === total && total > 0;
  return (
    <div
      className={
        "rounded-lg p-3 border " +
        (allGreen
          ? "border-[hsl(var(--aurin-sage)_/_0.55)] bg-[hsl(var(--aurin-sage)_/_0.06)]"
          : "border-amber-500/40 bg-amber-500/5")
      }
      data-testid={`admin-health-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))] mb-1">
        {label}
      </div>
      <div className="aurin-display text-2xl">
        {ok}
        <span className="text-[hsl(var(--aurin-text-muted))]"> / {total}</span>
      </div>
      <div
        className={
          "text-[11px] mt-1 " +
          (allGreen ? "text-[hsl(var(--aurin-sage))]" : "text-amber-400")
        }
      >
        {allGreen ? "all present" : `${total - ok} missing`}
      </div>
    </div>
  );
}
