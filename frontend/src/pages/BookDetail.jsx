import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ShoppingBag, BookOpenCheck, Mail, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { useAdmin } from "@/hooks/useAdmin";
import { adminBookPreviewUrl } from "@/lib/admin";
import useFreeAccess from "@/hooks/useFreeAccess";
import FreeAccessBadge from "@/components/FreeAccessBadge";

const fmtPrice = (price, currency) => {
  if (price == null || price === 0) return "Free";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${currency || "EUR"}`;
  }
};

export default function BookDetail() {
  const freeAccess = useFreeAccess();
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readMode, setReadMode] = useState(false);
  const { isAdmin, token: adminToken } = useAdmin();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/books/${slug}`);
        if (alive) setBook(res.data);
      } catch {
        if (alive) setError("This book could not be found.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="aurin-container py-40 text-center text-[hsl(var(--aurin-text-muted))]" data-testid="book-loading">
        Loading…
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="aurin-container py-40 text-center space-y-6" data-testid="book-error">
        <div className="text-[hsl(var(--aurin-text-muted))]">{error || "Not found"}</div>
        <Link to="/bookstore" className="aurin-btn aurin-btn-ghost">
          <ArrowLeft size={14} /> Return to Bookstore
        </Link>
      </div>
    );
  }

  if (readMode) {
    const isFreePdf = book.price === 0 && book.pdf_url;
    return (
      <div data-testid="book-read-mode" className="min-h-[80vh]">
        <div className="aurin-container pt-12 pb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => setReadMode(false)}
            data-testid="book-read-exit"
            className="text-[13px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Exit reading view
          </button>
          {isFreePdf && (
            <a
              data-testid="book-read-download"
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="aurin-btn aurin-btn-ghost"
            >
              <Download size={14} /> Download PDF
            </a>
          )}
        </div>
        {isFreePdf ? (
          <div className="mx-auto max-w-[1100px] px-4 md:px-8 pb-24">
            <div className="aurin-eyebrow mb-3">{book.subtitle}</div>
            <h1 className="aurin-display text-3xl md:text-4xl leading-[1.05] mb-6">{book.title}</h1>
            <div
              className="rounded-xl overflow-hidden border border-[hsl(var(--aurin-border-soft))] bg-black"
              style={{ height: "min(85vh, 1100px)" }}
            >
              <iframe
                data-testid="book-read-pdf"
                src={book.pdf_url}
                title={book.title}
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </div>
        ) : (
          <article className="mx-auto max-w-[68ch] px-6 md:px-10 pb-32">
            <div className="aurin-eyebrow mb-4">{book.subtitle}</div>
            <h1 className="aurin-display text-4xl md:text-5xl leading-[1.05] mb-10">{book.title}</h1>
            <div
              className="aurin-prose"
              data-testid="book-read-body"
              dangerouslySetInnerHTML={{ __html: book.html || "" }}
            />
          </article>
        )}
      </div>
    );
  }

  return (
    <div data-testid="page-book-detail">
      <section className="relative border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="absolute inset-0 aurin-grid-bg opacity-[0.18]" />
        <div className="absolute inset-0 aurin-glow" />
        <div className="aurin-container relative pt-16 md:pt-20 pb-14">
          <Link
            to="/bookstore"
            data-testid="book-back"
            className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Bookstore
          </Link>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div
                className="aspect-[3/4] rounded-xl overflow-hidden border border-[hsl(var(--aurin-border-soft))]"
                style={{
                  background:
                    "linear-gradient(155deg, hsl(140, 10%, 11%) 0%, hsl(140, 12%, 7%) 60%), radial-gradient(circle at 30% 20%, hsl(var(--aurin-sage) / 0.12), transparent 60%)",
                }}
              >
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-end p-8">
                    <div className="aurin-display text-3xl leading-[1.05] text-[hsl(var(--aurin-text))/0.95]">
                      {book.title}
                      {book.subtitle && (
                        <span className="block aurin-serif-italic text-base text-[hsl(var(--aurin-sage))] mt-3">
                          {book.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aurin-eyebrow mb-4">Book · {book.pages || "—"} pages</div>
              <h1
                className="aurin-display text-4xl md:text-5xl lg:text-[60px] leading-[1.05]"
                data-testid="book-title"
              >
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="mt-4 aurin-serif-italic text-[hsl(var(--aurin-sage))] text-xl">{book.subtitle}</p>
              )}
              {book.description && (
                <p className="mt-6 text-[15.5px] leading-[1.75] text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
                  {book.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3" data-testid="book-meta">
                {freeAccess.active && book.price > 0 ? (
                  <FreeAccessBadge testidSuffix={`book-${book.slug}`} />
                ) : (
                  <span className="aurin-chip">{fmtPrice(book.price, book.currency)}</span>
                )}
                <span className="aurin-chip">By {book.author || "Matrix Aurin"}</span>
                {book.tax_category === "book_zero_rate_ready" && (
                  <span className="aurin-chip" data-testid="book-tax-chip">0% VAT · Norway digital book</span>
                )}
                {(book.tags || []).map((t) => (
                  <span key={t} className="aurin-chip">#{t}</span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {book.price === 0 ? (
                  <>
                    <button
                      data-testid="book-read"
                      onClick={() => setReadMode(true)}
                      className="aurin-btn aurin-btn-primary"
                    >
                      <BookOpenCheck size={14} /> Read it now
                    </button>
                    {book.pdf_url && (
                      <a
                        data-testid="book-download"
                        href={book.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aurin-btn aurin-btn-ghost"
                      >
                        <Download size={14} /> Download PDF
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    {isAdmin ? (
                      <>
                        <a
                          data-testid="book-buy"
                          href={adminBookPreviewUrl(book.slug, adminToken)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Admin preview · serves the paid PDF directly"
                          className="aurin-btn aurin-btn-primary"
                        >
                          <Eye size={14} /> Preview download (admin)
                        </a>
                        <button
                          data-testid="book-read"
                          onClick={() => setReadMode(true)}
                          className="aurin-btn aurin-btn-ghost"
                        >
                          <BookOpenCheck size={14} /> Read online
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          data-testid="book-buy"
                          href={`/catalogue#7-days-of-clarity`}
                          title="Doors open soon — join the waitlist"
                          className="aurin-btn aurin-btn-primary"
                        >
                          Join the waitlist <ShoppingBag size={14} />
                        </a>
                        <button
                          data-testid="book-read"
                          onClick={() => setReadMode(true)}
                          className="aurin-btn aurin-btn-ghost"
                        >
                          <BookOpenCheck size={14} /> Read online
                        </button>
                        <a
                          data-testid="book-download"
                          href={`/catalogue#7-days-of-clarity`}
                          title="Full PDF unlocks after first wave opens"
                          className="aurin-btn aurin-btn-ghost"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>

              {book.price === 0 && (
                <LeadMagnetForm slug={book.slug} title={book.title} />
              )}

              <div className="mt-8 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                Delivery: {(book.delivery_options || []).map((d) => d.replace("_", " ")).join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CrossSell currentBook={book} />
    </div>
  );
}

/* -------------------------------------------------------------- *
 * CrossSell — "If this spoke to you" value-ladder module.
 *
 * Shown at the bottom of every BookDetail page. Picks 3 next-best
 * recommendations from the catalogue, audience-matched, and gently
 * suggests Clarity Release as the next quiet step for adult readers.
 * -------------------------------------------------------------- */
function CrossSell({ currentBook }) {
  const [others, setOthers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/books");
        const all = (res.data || []).filter((b) => b.slug !== currentBook.slug);
        // Same-audience first, then opposite, free books at the end.
        const matching = all.filter((b) => b.audience === currentBook.audience);
        const others = all.filter((b) => b.audience !== currentBook.audience);
        const ordered = [...matching, ...others].sort((a, b) => {
          // Free books last (we don't push the lead magnet on a paying page).
          if ((a.price || 0) === 0 && (b.price || 0) !== 0) return 1;
          if ((b.price || 0) === 0 && (a.price || 0) !== 0) return -1;
          return 0;
        });
        if (alive) setOthers(ordered.slice(0, 3));
      } catch {
        /* silent fall-back to empty */
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentBook.slug, currentBook.audience]);

  if (!others.length) return null;
  const isAdult = currentBook.audience !== "kids";

  return (
    <section
      className="border-t border-[hsl(var(--aurin-border-soft))] aurin-section-sm"
      data-testid="book-cross-sell"
    >
      <div className="aurin-container">
        <div className="aurin-eyebrow mb-3">— if this spoke to you</div>
        <h2 className="aurin-display text-3xl md:text-[40px] leading-[1.1] max-w-[28ch]">
          What might come{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            next, gently.
          </span>
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="book-cross-sell-grid">
          {others.map((b) => (
            <Link
              key={b.slug}
              to={`/bookstore/${b.slug}`}
              data-testid={`book-cross-sell-${b.slug}`}
              className="aurin-card overflow-hidden group hover:border-[hsl(var(--aurin-sage)_/_0.55)] transition-colors"
            >
              <div className="aspect-[3/4] bg-black overflow-hidden">
                {b.cover_image_url ? (
                  <img
                    src={b.cover_image_url}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full flex items-end p-6">
                    <div className="aurin-display text-2xl">{b.title}</div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
                  {freeAccess.active && b.price > 0
                    ? "Free during launch"
                    : fmtPrice(b.price, b.currency)}{" "}
                  · {b.audience === "kids" ? "Kids" : "Adult"}
                </div>
                <div className="aurin-display text-xl leading-snug mb-1">{b.title}</div>
                {b.subtitle && (
                  <div className="aurin-serif-italic text-[13px] text-[hsl(var(--aurin-sage))] mb-2">
                    {b.subtitle}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {isAdult && (
          <div
            className="aurin-card p-7 md:p-8 mt-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8"
            data-testid="book-cross-sell-clarity"
          >
            <div className="flex-1">
              <div className="aurin-eyebrow mb-2">a quiet next step</div>
              <h3 className="aurin-display text-2xl leading-snug max-w-[34ch]">
                A small hour, with{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  your own voice.
                </span>
              </h3>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mt-3 max-w-[58ch]">
                If a sentence in this book pressed on something old, the
                Clarity Release Cabinet is where you take it next — slowly,
                privately, and only as far as you wish to go.
              </p>
            </div>
            <Link
              to="/clarity-release"
              data-testid="book-cross-sell-clarity-cta"
              className="aurin-btn aurin-btn-primary md:shrink-0"
            >
              Visit the Cabinet
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- *
 * LeadMagnetForm — soft email capture for free books.
 * Calls POST /api/lead-magnet/book; on success shows a quiet
 * confirmation in place of the form (no toast, no redirect).
 * -------------------------------------------------------------- */
function LeadMagnetForm({ slug, title }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (!consent) {
      setError("Please tick the small consent box.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post("/lead-magnet/book", {
        email,
        name: name || null,
        book_slug: slug,
        consent,
      });
      setDone(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something quiet went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        data-testid="lead-magnet-success"
        className="mt-10 aurin-card p-6 md:p-7 border-[hsl(var(--aurin-sage))/0.5]"
      >
        <div className="aurin-eyebrow !mb-2">Sent</div>
        <h3 className="aurin-display text-xl mb-3">A small letter is on its way.</h3>
        <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
          {done.message ||
            "Thank you. Check your inbox in a few moments — and your spam folder, just in case the letter wandered."}
        </p>
        <p className="mt-4 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
          You can also open the book right now in this browser:{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="underline hover:text-[hsl(var(--aurin-sage))]"
          >
            read it here
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="lead-magnet-form"
      className="mt-10 aurin-card p-6 md:p-7 space-y-4"
    >
      <div>
        <div className="aurin-eyebrow !mb-2">A quiet letter, with the book</div>
        <h3 className="aurin-display text-xl">
          Have <em className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">{title}</em>{" "}
          delivered to your inbox.
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
          You'll get one short note with the book, written in our own voice. No
          drip campaign, no funnel pressure. If something here ever stops
          fitting, the unsubscribe link is in every letter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          data-testid="lead-magnet-name"
          type="text"
          placeholder="Your first name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border border-[hsl(var(--aurin-border))] rounded-md px-3 py-2.5 text-[14px] text-[hsl(var(--aurin-text))] placeholder:text-[hsl(var(--aurin-text-muted))/0.7] focus:outline-none focus:border-[hsl(var(--aurin-sage))] transition-colors"
        />
        <input
          data-testid="lead-magnet-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-[hsl(var(--aurin-border))] rounded-md px-3 py-2.5 text-[14px] text-[hsl(var(--aurin-text))] placeholder:text-[hsl(var(--aurin-text-muted))/0.7] focus:outline-none focus:border-[hsl(var(--aurin-sage))] transition-colors"
        />
      </div>

      <label className="flex items-start gap-2 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
        <input
          data-testid="lead-magnet-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          I'd like to receive the book and the occasional quiet letter from
          Matrix Aurin. I can unsubscribe at any time.
        </span>
      </label>

      {error && (
        <div
          data-testid="lead-magnet-error"
          className="text-[12.5px] text-[hsl(var(--aurin-rose))]"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        data-testid="lead-magnet-submit"
        className="aurin-btn aurin-btn-primary disabled:opacity-60"
      >
        <Mail size={14} /> {busy ? "Sending…" : "Send me the book"}
      </button>
    </form>
  );
}
