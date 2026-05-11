import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Sprout, Heart, BookHeart, ShieldCheck, Wand2, ArrowRight } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

const AGE_GROUPS = [
  {
    slug: "3-5",
    title: "Little Dreamers",
    age: "Ages 3–5",
    description: "Soft images, simple stories, and gentle themes. A warm beginning.",
    icon: Sprout,
  },
  {
    slug: "6-8",
    title: "Explorers",
    age: "Ages 6–8",
    description: "Slightly more complex pictures, small adventures, and friendly heroes.",
    icon: BookHeart,
  },
  {
    slug: "9-12",
    title: "Future Builders",
    age: "Ages 9–12",
    description: "More detailed pictures, room for imagination, and quiet themes that grow with the reader.",
    icon: Heart,
  },
];

export default function KidsUniverse() {
  const [kidsBooks, setKidsBooks] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API}/api/books`);
        if (!r.ok) return;
        const d = await r.json();
        const books = Array.isArray(d) ? d : (d.books || []);
        if (alive) setKidsBooks(books.filter((b) => b.audience === "kids"));
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-kids">
      <PageHeader
        tone="kids"
        eyebrow="Kids Universe"
        title="A safe, gentle place for"
        italicWord="young minds."
        description="The calmest corner of the place. Warm for children, trustworthy for parents. No noise, no chaos. Stories, gentle practices, a small room for quiet drawing."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="aurin-chip" data-testid="kids-safe-chip">
            <ShieldCheck size={12} /> No ads · No tracking · No 18+ gate
          </span>
          <span className="aurin-chip" data-testid="kids-parent-chip">
            Built with parents in mind
          </span>
        </div>
      </PageHeader>

      {/* Age groups */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Age groups</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-14">
            A world for every{" "}
            <span className="aurin-serif-italic" style={{ color: "#E3B48C" }}>
              stage of wonder.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AGE_GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.slug}
                  data-testid={`kids-age-${g.slug}`}
                  className="aurin-card p-8 relative overflow-hidden"
                >
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl"
                    style={{ background: i % 2 === 0 ? "#A8C09A" : "#E3B48C" }}
                  />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
                      <Icon size={18} strokeWidth={1.4} />
                    </div>
                    <div className="mt-7 text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                      {g.age}
                    </div>
                    <h3 className="aurin-display text-2xl mt-2">{g.title}</h3>
                    <p className="mt-4 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                      {g.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Children's Books — discovery layer.
          NO commerce duplication: each card links to the central Bookstore. */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="kids-featured-books"
      >
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-4 flex items-center gap-2">
            <BookHeart size={12} /> Featured Children's Books
          </div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-3">
            Stories that{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              hold a small hand.
            </span>
          </h2>
          <p className="aurin-serif-italic text-[15px] text-[hsl(var(--aurin-sage))] mb-10 max-w-[60ch]">
            Each book opens in the Bookstore — one shared place for purchase,
            preview, and quiet reading.
          </p>
          {kidsBooks.length === 0 ? (
            <p className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
              The shelf is being arranged. Return in a breath.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {kidsBooks.map((b) => (
                <Link
                  key={b.slug}
                  to={`/bookstore/${b.slug}`}
                  data-testid={`kids-book-${b.slug}`}
                  className="aurin-card p-6 border border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))/0.5] transition-all duration-500 group block"
                >
                  {b.cover_image_url && (
                    <div className="aspect-[3/4] rounded-md overflow-hidden mb-4 bg-[hsl(var(--aurin-bg-elevated))]">
                      <img
                        src={b.cover_image_url}
                        alt={b.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        data-testid={`kids-book-image-${b.slug}`}
                      />
                    </div>
                  )}
                  <h3 className="aurin-display text-lg leading-snug text-[hsl(var(--aurin-text))] mb-2">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="text-[13px] aurin-serif-italic text-[hsl(var(--aurin-sage))] mb-3 leading-relaxed">
                      {b.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-[12px]">
                    <span className="text-[hsl(var(--aurin-text-muted))]">
                      {b.price > 0 ? `$${b.price}` : "Free"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[hsl(var(--aurin-sage))] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open in Bookstore <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10">
            <Link
              to="/bookstore"
              data-testid="kids-all-books-link"
              className="aurin-link text-[13px] tracking-wide inline-flex items-center gap-2"
            >
              See all books in the Bookstore <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Creative Studio (placeholder) */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="aurin-eyebrow mb-4 flex items-center gap-2">
              <Wand2 size={12} /> Coloring Studio · Coming soon
            </div>
            <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch]">
              Read a story.{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                Make it a coloring page.
              </span>
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
              A child types a small idea — a fox, a quiet room, a kite — and a
              calm line drawing arrives, ready to colour. For now, a small
              gallery of hand-drawn pages waits for you here.
            </p>
            <Link
              to="/kids-universe/coloring"
              data-testid="kids-coloring-cta"
              className="aurin-btn aurin-btn-primary mt-6"
            >
              Open the Coloring Studio
            </Link>
          </div>
          <div className="md:col-span-5">
            <div
              className="aurin-card overflow-hidden relative"
              data-testid="kids-bedtime-visual"
            >
              <img
                src="/assets/kids/visualisations/bedtime-angel.png"
                alt="A starry night angel watching over a small child holding a fox"
                data-testid="kids-bedtime-image"
                className="w-full h-auto block aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[hsl(220,40%,8%)/0.92] to-transparent p-5">
                <div className="aurin-display text-[hsl(var(--aurin-text))] text-lg leading-snug">
                  A quiet night, watched over by{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    gentle angels.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Trailer — quiet 30s video introducing the kids universe.
          Self-hosted because the file is small (~3MB). Muted, autoplay,
          loop — calm by design, no audio surprise. */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="kids-story-trailer"
      >
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div className="aurin-eyebrow mb-4">A small story trailer</div>
            <h2 className="aurin-display text-3xl md:text-4xl leading-[1.1] max-w-[20ch]">
              A book that{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                opens itself.
              </span>
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[44ch]">
              A quiet preview of one of our children's stories — no sound, no rush,
              no flashing. Just a calm visual you can watch with a small one
              beside you.
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="aurin-card overflow-hidden">
              <video
                src="/assets/kids/visualisations/book.mp4"
                poster="/assets/kids/visualisations/bedtime-angel.png"
                data-testid="kids-story-trailer-video"
                className="w-full h-auto block"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
