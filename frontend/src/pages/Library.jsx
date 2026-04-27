import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import {
  Search,
  BookOpen,
  FileText,
  Headphones,
  Film,
  Lock,
  CheckCircle2,
  FileIcon,
  Sparkles,
} from "lucide-react";
import { fetchEntries } from "@/lib/api";
import InstagramCTA from "@/components/InstagramCTA";
import MeditationPlayer from "@/components/MeditationPlayer";
import { Compass } from "lucide-react";

const kindMeta = {
  book: { icon: BookOpen, label: "Book" },
  protocol: { icon: FileText, label: "Reading" },
  audio: { icon: Headphones, label: "Audio" },
  video: { icon: Film, label: "Video" },
  article: { icon: FileIcon, label: "Article" },
  story: { icon: Sparkles, label: "Story" },
};

const AUDIENCES = [
  { key: "all", label: "All" },
  { key: "grown-ups", label: "Grown-ups" },
  { key: "kids-universe", label: "Kids Universe" },
  { key: "reflections", label: "Reflections" },
];

export default function Library() {
  const [entries, setEntries] = useState([]);
  const [audience, setAudience] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const ents = await fetchEntries({ surface: "library" });
        if (!alive) return;
        setEntries(ents);
      } catch {
        if (alive) setError("Could not load the library. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((e) =>
        audience === "all" ? true : (e.audience || "grown-ups") === audience
      )
      .filter((e) =>
        query.trim() === ""
          ? true
          : `${e.title} ${e.description || ""}`
              .toLowerCase()
              .includes(query.toLowerCase())
      );
  }, [entries, audience, query]);

  return (
    <div data-testid="page-library">
      <PageHeader
        tone="library"
        eyebrow="Library · For adults"
        title="Sometimes one thought is enough"
        italicWord="to set something moving."
        description="Take what you need here. No obligation."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" data-testid="library-feature-row">
            <Link
              to="/the-beginning"
              data-testid="library-the-beginning-card"
              className="lg:col-span-7 aurin-card p-7 md:p-8 group hover:border-[hsl(var(--aurin-sage))] transition-colors flex flex-col justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                  <Compass size={18} strokeWidth={1.4} />
                </div>
                <div>
                  <div className="aurin-eyebrow !mb-1">The Beginning · Free</div>
                  <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                    A quiet shift starts when you{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      see clearly.
                    </span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch]">
                    Seven small steps. Not to fix anything — just to see.
                    Free for now. What you write stays yours alone.
                  </p>
                </div>
              </div>
              <div className="text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                Open The Beginning →
              </div>
            </Link>
            <div className="lg:col-span-5">
              <InstagramCTA testidPrefix="library-ig-cta" className="h-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div
            className="flex items-center gap-2 w-full md:max-w-sm rounded-full border border-[hsl(var(--aurin-border))] px-4 py-2.5"
            data-testid="library-search-wrap"
          >
            <Search size={15} className="text-[hsl(var(--aurin-text-muted))]" />
            <input
              data-testid="library-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the library…"
              className="bg-transparent outline-none text-sm placeholder:text-[hsl(var(--aurin-text-muted))] w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap" data-testid="library-filter-tabs">
            {AUDIENCES.map((a) => (
              <FilterTab
                key={a.key}
                active={audience === a.key}
                onClick={() => setAudience(a.key)}
                testid={`library-filter-${a.key}`}
              >
                {a.label}
              </FilterTab>
            ))}
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading && (
            <div data-testid="library-loading" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              Loading the library…
            </div>
          )}

          {error && !loading && (
            <div data-testid="library-error" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="library-grid">
              {filtered.map((item) => {
                const meta = kindMeta[item.kind] || kindMeta.article;
                const Icon = meta.icon;
                const isFree = item.access === "free";
                return (
                  <Link
                    to={`/library/${item.slug}`}
                    key={item.id}
                    data-testid={`library-item-${item.slug}`}
                    className="aurin-card p-7 flex flex-col h-full group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[hsl(var(--aurin-text-muted))]">
                        <Icon size={15} strokeWidth={1.5} />
                        <span className="text-[11px] uppercase tracking-[0.2em]">
                          {meta.label}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${
                          isFree
                            ? "border-[hsl(var(--aurin-sage))/0.4] text-[hsl(var(--aurin-sage))]"
                            : "border-[hsl(var(--aurin-sand))/0.4] text-[hsl(var(--aurin-sand))]"
                        }`}
                        data-testid={`library-item-${item.slug}-access`}
                      >
                        {isFree ? <CheckCircle2 size={12} /> : <Lock size={11} />}
                        {isFree ? "Free" : "Member"}
                      </span>
                    </div>

                    <h3 className="aurin-display text-2xl mt-7 leading-[1.15] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-7 pt-5 border-t border-[hsl(var(--aurin-border-soft))] flex items-center justify-between text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                      <span>{(item.audience || "grown-ups").replace("-", " ")}</span>
                      <span>{item.sections?.length || 0} sections</span>
                    </div>

                    <div className="mt-5 text-[13px] text-[hsl(var(--aurin-text))] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                      Open →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div data-testid="library-empty" className="text-center py-20 text-[hsl(var(--aurin-text-muted))]">
              Nothing matches this view yet. Try another audience.
            </div>
          )}
        </div>
      </section>

      {/* Guided meditation — free lead magnet */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="library-meditation-section"
      >
        <div className="aurin-container max-w-[760px]">
          <div className="aurin-eyebrow mb-4">Guided meditations</div>
          <h2 className="aurin-display text-3xl md:text-4xl leading-[1.1] mb-6">
            A first light, freely{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              given.
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mb-9 max-w-[58ch]">
            A short, quiet meditation you can come back to. Before the day
            starts, or as it ends. Sometimes that is enough.
          </p>

          <MeditationPlayer />

          <div
            data-testid="library-meditation-coming-soon"
            className="mt-10 aurin-card p-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0 text-[10px] uppercase tracking-[0.18em]">
              Soon
            </div>
            <div>
              <div className="aurin-eyebrow !mb-1">More to come</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                Longer meditations are being recorded slowly, in voice. They
                will arrive when the first one has settled with the people who
                need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SoulGiftCard />
    </div>
  );
}

function SoulGiftCard() {
  return (
    <section
      className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
      data-testid="soul-gift-section"
    >
      <div className="aurin-container">
        <div className="aurin-eyebrow mb-4">A small gift · You are not alone</div>
        <div className="aurin-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div
            className="md:col-span-5 bg-[hsl(40,30%,96%)] flex items-center justify-center p-6"
            data-testid="soul-gift-image-wrap"
          >
            <img
              src="/assets/brand/pure-soul-life-card.png"
              alt="Pure Soul Life — Love & support flourish with the help of angels"
              data-testid="soul-gift-image"
              className="w-full max-w-[360px] h-auto rounded-lg"
              loading="lazy"
            />
          </div>
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="aurin-display text-3xl md:text-4xl leading-[1.1]">
              Love &amp; support{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                flourish with the help of angels.
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-[1.75] text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
              <strong className="text-[hsl(var(--aurin-text))]">Pure Soul Life</strong>{" "}
              is a quiet project across languages — small offerings, soul gifts,
              meditations. If something here helped, even a little, you can
              keep this work alive for someone else.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://ko-fi.com/puresoulife"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="soul-gift-donate-1"
                className="aurin-btn aurin-btn-ghost"
              >
                €1 · Buy a soul gift
              </a>
              <a
                href="https://ko-fi.com/puresoulife"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="soul-gift-donate-5"
                className="aurin-btn aurin-btn-ghost"
              >
                €5 · Support us
              </a>
              <a
                href="https://ko-fi.com/puresoulife"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="soul-gift-donate-15"
                className="aurin-btn aurin-btn-primary"
              >
                €15 · Donate · Access a course
              </a>
            </div>
            <p className="mt-5 text-[12px] text-[hsl(var(--aurin-text-muted))]">
              Donations are processed by{" "}
              <a
                href="https://ko-fi.com/puresoulife"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--aurin-sage))] hover:underline"
                data-testid="soul-gift-kofi-link"
              >
                ko-fi.com/puresoulife
              </a>
              . Every gift, no matter how small, is held with care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterTab({ active, onClick, testid, children }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`text-[13px] rounded-full px-4 py-2 border transition-colors ${
        active
          ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
          : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85] hover:border-[hsl(var(--aurin-sage))] hover:text-[hsl(var(--aurin-sage))]"
      }`}
    >
      {children}
    </button>
  );
}
