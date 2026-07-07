import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ShoppingBag, Search, Download, BookOpenCheck, ExternalLink, ArrowRight, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { buildLemonCheckoutUrl } from "@/lib/lemonsqueezy";
import InstagramCTA from "@/components/InstagramCTA";
import { useAdmin } from "@/hooks/useAdmin";
import { adminBookPreviewUrl } from "@/lib/admin";
import useFreeAccess from "@/hooks/useFreeAccess";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";

const fmtPrice = (price, currency) => {
  if (price == null || price === 0) return "Free";
  const cur = currency || "EUR";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
    }).format(price);
  } catch (e) {
    return `${price} ${cur}`;
  }
};

export default function Bookstore() {
  const freeAccess = useFreeAccess();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(true);
  const { isAdmin, token: adminToken } = useAdmin();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/books");
        if (alive) setBooks(res.data || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      books
        .filter((b) =>
          audience === "all" ? true : (b.audience || "adult") === audience
        )
        .filter((b) =>
          query.trim() === ""
            ? true
            : `${b.title} ${b.subtitle || ""} ${b.description || ""}`
                .toLowerCase()
                .includes(query.toLowerCase())
        ),
    [books, query, audience]
  );

  return (
    <div data-testid="page-bookstore">
      <PageHeader
        tone="library"
        eyebrow="Bookstore"
        title="If something started moving in you,"
        italicWord="here you can go deeper."
        description="Not to do more — to see more clearly. Each title is sold once and yours to keep."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="aurin-chip" data-testid="bookstore-tax-chip">
            · 0% VAT · digital books · Norway
          </span>
          <span className="aurin-chip" data-testid="bookstore-payments-chip">
            · Reading catalogue · purchases open soon
          </span>
        </div>
      </PageHeader>

      {/* Bookstore hero — founder-supplied: stacked books + a quiet writer */}
      <section className="aurin-section-xs" data-testid="bookstore-hero-image-section">
        <div className="aurin-container">
          <figure
            data-testid="bookstore-hero-image"
            className="aurin-card overflow-hidden"
          >
            <img
              src="/assets/illustrations/library-bookstore.jpg"
              alt="A small stack of clothbound books beside a woman writing quietly"
              className="w-full h-auto block"
              loading="eager"
            />
          </figure>
        </div>
      </section>

      <section className="border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div
            className="flex items-center gap-2 w-full md:max-w-sm rounded-full border border-[hsl(var(--aurin-border))] px-4 py-2.5"
            data-testid="bookstore-search-wrap"
          >
            <Search size={15} className="text-[hsl(var(--aurin-text-muted))]" />
            <input
              data-testid="bookstore-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the bookstore…"
              className="bg-transparent outline-none text-sm placeholder:text-[hsl(var(--aurin-text-muted))] w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap" data-testid="bookstore-audience-tabs">
            {[
              { key: "all", label: "All" },
              { key: "adult", label: "Adult" },
              { key: "kids", label: "Kids" },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setAudience(a.key)}
                data-testid={`bookstore-audience-${a.key}`}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${
                  audience === a.key
                    ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
                    : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "title" : "titles"}`}
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="mb-10" data-testid="bookstore-ig-cta-wrap">
            <InstagramCTA testidPrefix="bookstore-ig-cta" />
          </div>

          <p
            data-testid="bookstore-core-library-line"
            className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mb-4 max-w-[60ch] aurin-serif-italic"
          >
            Slow-written books for adults. Calm storybooks for children.
            No urgency. Read in the order that feels true.
          </p>

          <p
            data-testid="bookstore-body-thread"
            className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/80 mb-2 max-w-[58ch]"
          >
            Your body usually knows before your mind does. If a title pulls
            you, sit with it for a moment.
          </p>
          <p
            data-testid="bookstore-soft-consequence"
            className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/80 mb-3 max-w-[58ch] aurin-serif-italic"
          >
            You don't have to take my word for it. Just see what shifts in you.
          </p>
          <p
            data-testid="bookstore-author-note"
            className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/70 mb-10 max-w-[58ch]"
          >
            Material is created by the author. Technical tools were used only to support clarity.
          </p>

          {loading && (
            <div data-testid="bookstore-loading" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              Loading the bookstore…
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="bookstore-grid">
              {filtered.map((b) => (
                <article
                  key={b.id}
                  data-testid={`bookstore-item-${b.slug}`}
                  className="aurin-card overflow-hidden flex flex-col"
                >
                  {/* Cover area — placeholder block, calm & on-brand */}
                  <div
                    className="aspect-[3/4] relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(155deg, hsl(140, 10%, 11%) 0%, hsl(140, 12%, 7%) 60%), radial-gradient(circle at 30% 20%, hsl(var(--aurin-sage) / 0.12), transparent 60%)",
                    }}
                  >
                    {b.cover_image_url ? (
                      <img
                        src={b.cover_image_url}
                        alt={b.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-end p-6">
                        <div className="aurin-display text-[28px] leading-[1.05] max-w-[18ch] text-[hsl(var(--aurin-text))/0.92]">
                          {b.title}
                          {b.subtitle && (
                            <span className="block text-sm aurin-serif-italic text-[hsl(var(--aurin-sage))] mt-3">
                              {b.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 aurin-chip" data-testid={`bookstore-item-${b.slug}-price`}>
                      {freeAccess.active && b.price > 0
                        ? "Free during launch"
                        : fmtPrice(b.price, b.currency)}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                      Book · {b.pages || "—"} pages
                    </div>
                    <h3 className="aurin-display text-2xl mt-3 leading-[1.15]">{b.title}</h3>
                    {b.description && (
                      <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] line-clamp-3">
                        {b.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-[11.5px] text-[hsl(var(--aurin-text-muted))]">
                      {b.delivery_options?.includes("read_online") && (
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpenCheck size={12} /> Read online
                        </span>
                      )}
                      {b.delivery_options?.includes("download_pdf") && (
                        <span className="inline-flex items-center gap-1.5 ml-2">
                          <Download size={12} /> PDF
                        </span>
                      )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-[hsl(var(--aurin-border-soft))] flex items-center justify-between gap-3">
                      {b.external_read_url ? (
                        <a
                          href={b.external_read_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`bookstore-item-${b.slug}-preview`}
                          className="text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors inline-flex items-center gap-1.5"
                        >
                          Preview <ExternalLink size={12} />
                        </a>
                      ) : b.pdf_url && b.price === 0 ? (
                        <a
                          href={b.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`bookstore-item-${b.slug}-open`}
                          className="text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
                        >
                          Open the book →
                        </a>
                      ) : (
                        <Link
                          to={`/bookstore/${b.slug}`}
                          data-testid={`bookstore-item-${b.slug}-read`}
                          className="text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
                        >
                          About this book →
                        </Link>
                      )}
                      {b.price === 0 && b.pdf_url ? (
                        <a
                          href={b.pdf_url}
                          download
                          data-testid={`bookstore-item-${b.slug}-take`}
                          className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                        >
                          Take it <Download size={12} />
                        </a>
                      ) : b.price === 0 ? (
                        <Link
                          to={`/bookstore/${b.slug}`}
                          data-testid={`bookstore-item-${b.slug}-read-free`}
                          className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                        >
                          Read it <ArrowRight size={12} />
                        </Link>
                      ) : (
                        (() => {
                          if (freeAccess.active) {
                            // During the free-access window, hide the
                            // LemonSqueezy checkout link entirely; the
                            // wanderer reads the book from the Library
                            // instead. We point them to the detail page.
                            return (
                              <Link
                                to={`/library/${b.slug}`}
                                data-testid={`bookstore-item-${b.slug}-buy`}
                                className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                              >
                                Read it <ArrowRight size={12} />
                              </Link>
                            );
                          }
                          const checkoutUrl = buildLemonCheckoutUrl(b.lemonsqueezy_variant_id);
                          if (checkoutUrl) {
                            if (LAUNCH_PAUSE) {
                              return (
                                <LaunchPauseButton
                                  testid={`bookstore-item-${b.slug}-buy`}
                                  label="Notify me"
                                  hideSubtext
                                  size="sm"
                                />
                              );
                            }
                            return (
                              <a
                                href={checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`bookstore-item-${b.slug}-buy`}
                                className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                              >
                                Continue <ShoppingBag size={12} />
                              </a>
                            );
                          }
                          return isAdmin ? (
                            <a
                              data-testid={`bookstore-item-${b.slug}-buy`}
                              href={adminBookPreviewUrl(b.slug, adminToken)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Admin preview · paid PDF"
                              className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                            >
                              <Eye size={12} /> Preview
                            </a>
                          ) : (
                            <a
                              href="/catalogue#7-days-of-clarity"
                              data-testid={`bookstore-item-${b.slug}-buy`}
                              title="Doors open soon — join the quiet list"
                              className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
                            >
                              Waitlist <ShoppingBag size={12} />
                            </a>
                          );
                        })()
                      )}
                    </div>
                    {b.pdf_url && b.price > 0 && (
                      <a
                        href={b.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`bookstore-item-${b.slug}-sample-pdf`}
                        className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-[hsl(var(--aurin-sage))] hover:underline"
                      >
                        <Download size={12} /> Free sample
                      </a>
                    )}
                    {b.price > 0 ? (
                      <p
                        data-testid={`bookstore-item-${b.slug}-refund-notice`}
                        className="mt-3 text-[11px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
                      >
                        {b.lemonsqueezy_variant_id
                          ? "By continuing, you accept the "
                          : "The full version opens soon. By continuing later, you accept the "}
                        <Link
                          to="/legal#refund-policy"
                          className="text-[hsl(var(--aurin-sage))] hover:underline"
                        >
                          Refund Policy
                        </Link>
                        .
                      </p>
                    ) : (
                      <p
                        data-testid={`bookstore-item-${b.slug}-free-notice`}
                        className="mt-3 text-[11px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
                      >
                        Take it, if it feels meant for you.
                      </p>
                    )}
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
                <div data-testid="bookstore-empty" className="col-span-full text-center py-20 text-[hsl(var(--aurin-text-muted))]">
                  Nothing matches this search.
                </div>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div
              data-testid="bookstore-closing-note"
              className="mt-16 pt-10 border-t border-[hsl(var(--aurin-border-soft))] max-w-[58ch]"
            >
              <p className="aurin-serif-italic text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
                If something here keeps moving in you, you can come back.
                <br />
                Nothing here will run out.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
