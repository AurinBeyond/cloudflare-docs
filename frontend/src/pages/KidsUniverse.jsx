import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import KidsAgeGate from "@/components/KidsAgeGate";
import {
  Sprout,
  Heart,
  BookHeart,
  ShieldCheck,
  Wand2,
  ArrowRight,
  ChevronDown,
  Headphones,
  Palette,
  Puzzle,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import useFreeAccess from "@/hooks/useFreeAccess";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const API = __BACKEND_URL__;

// §KIDS-UNIVERSE-V2 2026-02-09 — Per-age "warm-up" treats. Founder
// directive: free page must FEEL like a doorway, not a dead end.
// Each age-group card expands to show three small free items + a
// clear path into the paid Aurin's Room. Items marked `status:
// "soon"` show a soft "Coming this week" pill so we never link to
// broken downloads — Anna fills the real assets at her own pace.
const AGE_TREATS = {
  "3-5": {
    aurinSlug: "little-dreamers",
    treats: [
      {
        icon: Headphones,
        title: "A tiny bedtime audio",
        body: "Three soft minutes — Aurin says hello and tells one small story.",
        cta: "Listen",
        href: "/aurins-room/stories",
        status: "ready",
      },
      {
        // §AUDIT-FIX 2026-02-09 — 23 coloring pages exist in DB for this
        // age group. The old "Coming this week" badge was lying to parents.
        icon: Palette,
        title: "Coloring pages — a new one every day",
        body: "A growing library of soft scenes. Print and color together — slow, screen-free.",
        cta: "Open coloring studio",
        href: "/kids-universe/coloring",
        status: "ready",
      },
      {
        icon: Puzzle,
        title: "Cut-and-fold puzzle",
        body: "Print, glue to cardboard, cut into six pieces — a slow-craft hour.",
        cta: "Coming this week",
        href: null,
        status: "soon",
      },
    ],
  },
  "6-8": {
    aurinSlug: "explorers",
    treats: [
      {
        icon: Headphones,
        title: "A short adventure story",
        body: "Five minutes — Aurin's voice tells one of the explorer tales.",
        cta: "Listen",
        href: "/aurins-room/stories",
        status: "ready",
      },
      {
        icon: Palette,
        title: "Coloring pages — adventure scenes",
        body: "A library of winding paths, forest meetings, and small heroes. New ones added every day.",
        cta: "Open coloring studio",
        href: "/kids-universe/coloring",
        status: "ready",
      },
      {
        icon: Puzzle,
        title: "Word-search printable",
        body: "Twelve gentle words hidden in the page — slow, quiet, screen-free.",
        cta: "Coming this week",
        href: null,
        status: "soon",
      },
    ],
  },
  "9-12": {
    aurinSlug: "dreamweavers",
    treats: [
      {
        icon: Headphones,
        title: "A reflective audio",
        body: "Seven minutes — Aurin invites the listener to notice their own thoughts.",
        cta: "Listen",
        href: "/aurins-room/stories",
        status: "ready",
      },
      {
        icon: Palette,
        title: "Coloring pages — reflective & intricate",
        body: "Inner compass, dreamweavers, gentle mandalas — built for older minds. Fresh page every day.",
        cta: "Open coloring studio",
        href: "/kids-universe/coloring",
        status: "ready",
      },
      {
        icon: Puzzle,
        title: "Riddle & guess game",
        body: "A page of riddles to solve with a parent or sibling — no screen needed.",
        cta: "Coming this week",
        href: null,
        status: "soon",
      },
    ],
  },
};

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
    // §FOUNDER 2026-05-22 — unified from "Future Builders" to
    // "Dreamweavers" to match Aurin's Room taxonomy. Same age group,
    // one name across the brand. Slug stays "9-12" so backend filters
    // and existing /kids-universe DB references keep working.
    slug: "9-12",
    title: "Dreamweavers",
    age: "Ages 9–12",
    description: "More detailed pictures, room for imagination, and quiet themes that grow with the reader.",
    icon: Heart,
  },
];

// §KIDS-UNIVERSE-V3 2026-02-10 — Artist-made hero images for each age
// group. Files were created days ago but never wired in. Anna's directive
// (founder, 2026-02-10): "kogu see ruum muutub lastepäraseks, elavaks
// huvitavaks disaini osas". These images live in /public/assets/aurin/.
const AGE_HERO_IMAGE = {
  "3-5":  "/assets/aurin/little-dreamers-hero.png",
  "6-8":  "/assets/aurin/explorers-hero.png",
  "9-12": "/assets/aurin/dreamweavers-hero.png",
};

export default function KidsUniverse() {
  const freeAccess = useFreeAccess();
  const [kidsBooks, setKidsBooks] = useState([]);
  // §KIDS-UNIVERSE-V2 — Track which age card is currently expanded.
  // Only one open at a time so the page never feels overwhelming.
  const [openAge, setOpenAge] = useState(null);

  // §KIDS-UNIVERSE-V2 — Parent suggestion box state. Anna's directive:
  // give parents a small inviting voice. We reuse the existing
  // /api/reach-out endpoint with topic=feature_request so the
  // suggestion lands in the same support inbox without a new schema.
  const [suggestion, setSuggestion] = useState({ name: "", email: "", message: "" });
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestion.message.trim()) return;
    setSuggesting(true);
    try {
      await fetch(`${API}/api/reach-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestion.name || "Parent (Kids Universe)",
          email: suggestion.email || "noreply@kids-universe.local",
          topic: "kids",
          message: `[Kids Universe Suggestion]\n\n${suggestion.message.trim()}`,
          issue_tags: ["feature_request"],
        }),
      });
      setSuggestionSent(true);
    } catch {
      // Soft-fail — don't alarm the parent. Anna sees nothing in the
      // inbox if it failed but we won't crash the page.
    } finally {
      setSuggesting(false);
    }
  };

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
    <div data-testid="page-kids" className="relative">
      {/* §K4 BUILDER-CONTEST 2026-02-29 — Age gate (asks once per browser). */}
      <KidsAgeGate />
      {/* §KIDS-UNIVERSE-V3 2026-02-10 — Floating Aurin companion in
          the corner, watching from above. Anna's directive: the page
          must feel inhabited, not a list. */}
      <img
        src="/assets/aurin/aurin-companion.png"
        alt=""
        aria-hidden="true"
        data-testid="kids-universe-aurin-companion"
        className="hidden md:block pointer-events-none absolute top-32 right-6 lg:right-12 w-28 lg:w-36 opacity-90 z-10 animate-pulse"
        style={{ animationDuration: "5s" }}
      />
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
              const treats = AGE_TREATS[g.slug];
              const isOpen = openAge === g.slug;
              return (
                <div
                  key={g.slug}
                  data-testid={`kids-age-${g.slug}`}
                  className={`aurin-card relative overflow-hidden transition-all duration-300 ${
                    isOpen ? "md:col-span-3 md:row-span-2" : ""
                  }`}
                >
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none"
                    style={{ background: i % 2 === 0 ? "#A8C09A" : "#E3B48C" }}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenAge(isOpen ? null : g.slug)}
                    data-testid={`kids-age-${g.slug}-toggle`}
                    className="relative w-full text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    {/* §KIDS-UNIVERSE-V3 2026-02-10 — Artist-made hero image
                        anchors the card. Wraps the abstract icon-circle in
                        actual painted scene so the page IS the room, not
                        a list of boxes. */}
                    {AGE_HERO_IMAGE[g.slug] && (
                      <div
                        className="relative w-full overflow-hidden"
                        style={{
                          height: 220,
                          background: i % 2 === 0
                            ? "linear-gradient(180deg, #f3eadd 0%, #e8d8c5 100%)"
                            : "linear-gradient(180deg, #e8e0d0 0%, #d8c8b0 100%)",
                        }}
                      >
                        <img
                          src={AGE_HERO_IMAGE[g.slug]}
                          alt={`${g.title} — ${g.age}`}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          data-testid={`kids-age-${g.slug}-hero-image`}
                        />
                        {/* Soft top gradient so the eyebrow text inside is readable */}
                        <div
                          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,250,240,0.6) 0%, rgba(255,250,240,0) 100%)",
                          }}
                        />
                        <div className="absolute top-4 left-5 right-5 flex items-start justify-between gap-2">
                          <span className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {g.age}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-[hsl(var(--aurin-text-muted))] transition-transform duration-300 bg-white/70 rounded-full p-0.5 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-7">
                      <h3
                        className="text-[32px] sm:text-[36px] leading-[1.05]"
                        style={{
                          fontFamily: "Caveat, Fraunces, serif",
                          fontWeight: 600,
                          color: "hsl(var(--aurin-sage))",
                        }}
                      >
                        {g.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {g.description}
                      </p>
                      <div className="mt-5 text-[12px] tracking-[0.16em] uppercase text-[hsl(var(--aurin-sage))] flex items-center gap-1.5">
                        {isOpen ? "Close" : "See what's free for this age"}
                        <ArrowRight size={11} />
                      </div>
                    </div>
                  </button>

                  {/* §KIDS-HUBS 2026-02-09 — direct doorway into the
                      warm age-themed Hub (Talk / Story / Color / Stars).
                      Sits below the free-treats toggle so parents can
                      either preview or step straight inside. */}
                  <Link
                    to={`/kids-universe/${g.slug}/hub`}
                    data-testid={`kids-age-${g.slug}-open-hub`}
                    className="relative mx-8 mb-6 -mt-1 inline-flex items-center gap-1.5 text-[12px] tracking-[0.16em] uppercase text-[hsl(var(--aurin-amber))] hover:text-[hsl(var(--aurin-amber))] transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open the warm room <ArrowRight size={11} />
                  </Link>

                  {/* §KIDS-UNIVERSE-V2 — Expanded treats panel. Three small
                      free items per age + a clear paid path into Aurin's
                      Room. Items not yet seeded by Anna show a "Coming
                      this week" pill so nothing dead-links. */}
                  {isOpen && treats && (
                    <div
                      data-testid={`kids-age-${g.slug}-treats`}
                      className="relative px-8 pb-8 border-t border-[hsl(var(--aurin-border-soft))] pt-7"
                    >
                      <div className="aurin-eyebrow mb-4">A few free things to start with</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {treats.treats.map((t, idx) => {
                          const TIcon = t.icon;
                          return (
                            <div
                              key={idx}
                              data-testid={`kids-age-${g.slug}-treat-${idx}`}
                              className="rounded-xl border border-[hsl(var(--aurin-border-soft))] p-5 bg-[hsl(var(--aurin-bg-elev))/0.45] flex flex-col"
                            >
                              <div className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] mb-3">
                                <TIcon size={15} strokeWidth={1.4} />
                              </div>
                              <h4 className="aurin-serif text-[15.5px] leading-snug text-[hsl(var(--aurin-text))]">
                                {t.title}
                              </h4>
                              <p className="mt-2 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] flex-1">
                                {t.body}
                              </p>
                              {t.status === "ready" && t.href ? (
                                <Link
                                  to={t.href}
                                  className="mt-4 aurin-btn aurin-btn-ghost text-[12px] px-3 py-1.5 inline-flex items-center gap-1.5 self-start"
                                >
                                  {t.cta}
                                  <ArrowRight size={11} />
                                </Link>
                              ) : (
                                <span className="mt-4 inline-flex items-center gap-1.5 self-start text-[11px] tracking-[0.18em] uppercase text-[hsl(var(--aurin-amber))/0.85] border border-[hsl(var(--aurin-amber))/0.35] rounded-full px-3 py-1.5">
                                  <Sparkles size={10} />
                                  {t.cta}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Clear paid path */}
                      <div className="mt-7 rounded-xl border border-[hsl(var(--aurin-sage))/0.35] bg-[hsl(var(--aurin-sage))/0.06] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <p className="text-[11px] tracking-[0.22em] uppercase text-[hsl(var(--aurin-sage))] mb-1.5">
                            When the child is ready
                          </p>
                          <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                            Open the full Aurin's Room — voice or text, gentle
                            conversation, made for this age.
                          </p>
                        </div>
                        <Link
                          to={`/aurins-room/${treats.aurinSlug}`}
                          data-testid={`kids-age-${g.slug}-enter-aurin`}
                          className="aurin-btn aurin-btn-primary text-[13px] inline-flex items-center gap-1.5 shrink-0"
                        >
                          Open Aurin's Room
                          <ArrowRight size={12} />
                        </Link>
                      </div>

                      <p className="mt-5 text-[11px] italic text-[hsl(var(--aurin-text-muted))]">
                        Come back next week — there's always one new gentle
                        thing waiting here.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* §AURIN 2026-05-20 — Soft entry into Aurin's Room. Companion
          surface for the same age groups shown above. */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="kids-aurins-room-link"
      >
        <div className="aurin-container">
          <div className="aurin-card p-8 md:p-10">
            <div className="aurin-eyebrow mb-3">A gentle companion</div>
            <h2 className="aurin-display text-3xl md:text-4xl max-w-[28ch] mb-4">
              Talk with{" "}
              <span className="aurin-serif-italic" style={{ color: "#E3B48C" }}>
                Aurin
              </span>
              .
            </h2>
            <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch] mb-6">
              A quiet friend who listens, plays, and remembers that
              childhood deserves to feel safe. Three paths — choose the
              one that fits the child.
            </p>
            <Link
              to="/aurins-room"
              data-testid="kids-aurins-room-cta"
              className="aurin-btn-primary inline-flex items-center gap-1.5"
            >
              Open Aurin's Room
              <ArrowRight size={14} />
            </Link>
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
                      {freeAccess.active && b.price > 0
                        ? "Free during launch"
                        : b.price > 0
                        ? `$${b.price}`
                        : "Free"}
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

      {/* Coloring Studio (placeholder) */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="aurin-eyebrow mb-4 flex items-center gap-2">
              <Wand2 size={12} /> Coloring Studio
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

      {/* §KIDS-UNIVERSE-V2 2026-02-09 — Parent suggestion box.
          Anna's directive: invite parents to co-build the Kids Universe.
          Suggestions land in the same Reach Out inbox under topic
          "kids" with issue_tag "feature_request" so triage stays
          organised. Two friendly fields (name + suggestion) — email
          is optional. On success we show a calm thank-you state. */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="kids-suggestion-box"
      >
        <div className="aurin-container">
          <div className="aurin-card p-8 md:p-10 max-w-[760px] mx-auto">
            <div className="aurin-eyebrow mb-3">For the parents</div>
            <h2 className="aurin-display text-2xl md:text-3xl max-w-[26ch] mb-4">
              What would make this corner{" "}
              <span className="aurin-serif-italic" style={{ color: "#E3B48C" }}>
                better for your child?
              </span>
            </h2>
            <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch] mb-7">
              We're building this slowly, with parents. If you have an idea, a
              theme your child loves, a small thing missing — please tell us.
              We read every suggestion.
            </p>

            {suggestionSent ? (
              <div
                data-testid="kids-suggestion-sent"
                className="flex items-start gap-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-sage))]"
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>
                  Thank you. Your idea reached us — it joins the list we read
                  every week. If you've left your email, we may write back.
                </span>
              </div>
            ) : (
              <form
                onSubmit={submitSuggestion}
                className="space-y-4"
                data-testid="kids-suggestion-form"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={suggestion.name}
                    onChange={(e) => setSuggestion((s) => ({ ...s, name: e.target.value }))}
                    data-testid="kids-suggestion-name"
                    className="reach-input"
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={suggestion.email}
                    onChange={(e) => setSuggestion((s) => ({ ...s, email: e.target.value }))}
                    data-testid="kids-suggestion-email"
                    className="reach-input"
                  />
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Your idea, theme, or small thing missing…"
                  value={suggestion.message}
                  onChange={(e) => setSuggestion((s) => ({ ...s, message: e.target.value }))}
                  data-testid="kids-suggestion-message"
                  className="reach-input"
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11.5px] text-[hsl(var(--aurin-text-muted))] max-w-[44ch]">
                    We're a small team — we may not reply to every note, but
                    every idea is read.
                  </p>
                  <button
                    type="submit"
                    disabled={suggesting || !suggestion.message.trim()}
                    data-testid="kids-suggestion-submit"
                    className="aurin-btn aurin-btn-primary text-[13px] inline-flex items-center gap-1.5 disabled:opacity-60 shrink-0"
                  >
                    {suggesting ? "Sending…" : "Send"}
                    <Send size={12} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
