import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ShoppingBag, BookOpenCheck } from "lucide-react";
import { api } from "@/lib/api";

const fmtPrice = (price, currency) => {
  if (price == null || price === 0) return "Free";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "NOK",
      minimumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${currency || "NOK"}`;
  }
};

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readMode, setReadMode] = useState(false);

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
    return (
      <div data-testid="book-read-mode" className="min-h-[80vh]">
        <div className="aurin-container pt-12 pb-8">
          <button
            onClick={() => setReadMode(false)}
            data-testid="book-read-exit"
            className="text-[13px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Exit reading view
          </button>
        </div>
        <article className="mx-auto max-w-[68ch] px-6 md:px-10 pb-32">
          <div className="aurin-eyebrow mb-4">{book.subtitle}</div>
          <h1 className="aurin-display text-4xl md:text-5xl leading-[1.05] mb-10">{book.title}</h1>
          <div
            className="aurin-prose"
            data-testid="book-read-body"
            dangerouslySetInnerHTML={{ __html: book.html || "" }}
          />
        </article>
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
                <span className="aurin-chip">{fmtPrice(book.price, book.currency)}</span>
                <span className="aurin-chip">By {book.author || "Matrix Aurin"}</span>
                {book.tax_category === "book_zero_rate_ready" && (
                  <span className="aurin-chip" data-testid="book-tax-chip">0% VAT · Norway digital book</span>
                )}
                {(book.tags || []).map((t) => (
                  <span key={t} className="aurin-chip">#{t}</span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button
                  data-testid="book-buy"
                  disabled
                  title="Payments not yet active"
                  className="aurin-btn aurin-btn-primary opacity-60 cursor-not-allowed"
                >
                  Buy access <ShoppingBag size={14} />
                </button>
                <button
                  data-testid="book-read"
                  onClick={() => setReadMode(true)}
                  className="aurin-btn aurin-btn-ghost"
                >
                  <BookOpenCheck size={14} /> Read online
                </button>
                <button
                  data-testid="book-download"
                  disabled
                  title="Download is enabled after purchase"
                  className="aurin-btn aurin-btn-ghost opacity-60 cursor-not-allowed"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>

              <div className="mt-8 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                Delivery: {(book.delivery_options || []).map((d) => d.replace("_", " ")).join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
