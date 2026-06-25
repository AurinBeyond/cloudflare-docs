/**
 * FromAnna.jsx — /from-anna  (The Upstairs Light)
 *
 * §AURIN BRAND LOCKS — see /app/frontend/src/data/fromAnna.js for the
 * full text. Short version:
 *   1. FOUNDATION LOCK — canonical texts, never paraphrased.
 *   2. FOUNDER VOICE LOCK — audio (when added) must sound human and
 *      intimate, never commercial. No scheduled cadence promised.
 *   3. KEEPER INDEPENDENCE LOCK — never merge keepers into Anna.
 *   4. PRESENCE AUTHENTICITY LOCK — every element must increase trust,
 *      never draw attention to the technology behind the house.
 *   5. HOUSE DESIGN PRINCIPLE — every new feature should make the
 *      house feel more lived in, not more complicated. Empty sections
 *      do not render; "Coming soon" is never displayed here.
 *   6. EXPERIENCE LOCK — this page is discovered, never promoted. No
 *      large CTAs, no banners, no sales blocks. A visitor must feel
 *      they have found something, not been sent through a funnel.
 *
 * Discovery rule (preserve the mystery):
 *   This page is reached only via a small footer link "A letter from
 *   upstairs". It is excluded from search indexing (noindex, nofollow)
 *   so it stays a quiet upstairs room rather than a marketing page.
 *
 * Visual contract:
 *   The downstairs rooms wear brass-on-dark. The upstairs study wears
 *   ink-on-paper. The two aesthetics are intentionally different so
 *   the visitor knows they have walked up a different staircase.
 */
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FROM_ANNA_SECTIONS, FROM_ANNA_META, sectionHasContent } from "@/data/fromAnna";

// ── Paper / ink palette (distinct from brass-and-dark rooms) ─────────
const PAPER       = "#efe7d6";   // warm cream paper
const PAPER_EDGE  = "#e3d9c2";   // faint paper tone for borders
const INK         = "#2b2620";   // dark sepia ink
const INK_SOFT    = "#4a4338";   // softer ink for body
const INK_MUTED   = "#6e6557";   // hairlines and meta labels
const INK_FAINT   = "#a89e8c";   // page eyebrow

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const HAND  = '"Caveat", "Cormorant Garamond", Georgia, serif';

// ── Subtle paper texture using layered radial gradients (CSS-only,
//    no asset request, honours the "ink on paper" feel). ─────────────
const PAPER_TEXTURE = {
  backgroundColor: PAPER,
  backgroundImage: [
    "radial-gradient(at 18% 22%, rgba(140,120,84,0.07) 0px, transparent 60%)",
    "radial-gradient(at 82% 78%, rgba(140,120,84,0.06) 0px, transparent 55%)",
    "radial-gradient(at 50% 50%, rgba(255,250,237,0.5) 0px, transparent 70%)",
  ].join(", "),
};

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto my-14"
      style={{
        width: 56,
        height: 1,
        background: INK_MUTED,
        opacity: 0.4,
      }}
    />
  );
}

function TextSection({ section, index }) {
  return (
    <section
      data-testid={`from-anna-section-${section.id}`}
      aria-labelledby={`from-anna-${section.id}-title`}
      className="max-w-[640px] mx-auto px-6 sm:px-8"
    >
      {section.kicker && (
        <p
          data-testid={`from-anna-section-${section.id}-kicker`}
          className="text-[11px] tracking-[0.42em] uppercase mb-5"
          style={{ color: INK_FAINT }}
        >
          {section.kicker}
        </p>
      )}
      <h2
        id={`from-anna-${section.id}-title`}
        data-testid={`from-anna-section-${section.id}-title`}
        className="text-[28px] sm:text-[34px] leading-[1.18] font-light mb-8"
        style={{ fontFamily: SERIF, color: INK }}
      >
        {section.title}
      </h2>
      <div data-testid={`from-anna-section-${section.id}-body`} className="space-y-5">
        {section.paragraphs.map((p, i) => (
          <p
            key={i}
            data-testid={`from-anna-section-${section.id}-p-${i}`}
            className="text-[16.5px] sm:text-[17px] leading-[1.85] font-light"
            style={{ fontFamily: SERIF, color: INK_SOFT }}
          >
            {p}
          </p>
        ))}
      </div>
      {index !== "last" && <Divider />}
    </section>
  );
}

function ImageSection({ section }) {
  return (
    <section
      data-testid={`from-anna-section-${section.id}`}
      className="max-w-[760px] mx-auto px-6 sm:px-8"
    >
      <figure>
        <img
          src={section.src}
          alt={section.alt || ""}
          data-testid={`from-anna-section-${section.id}-img`}
          className="block w-full h-auto"
          style={{
            border: `1px solid ${PAPER_EDGE}`,
            boxShadow: "0 1px 0 rgba(43,38,32,0.05), 0 18px 40px -28px rgba(43,38,32,0.45)",
          }}
        />
        {section.caption && (
          <figcaption
            data-testid={`from-anna-section-${section.id}-caption`}
            className="mt-4 text-[13px] italic text-center"
            style={{ fontFamily: SERIF, color: INK_MUTED }}
          >
            {section.caption}
          </figcaption>
        )}
      </figure>
      <Divider />
    </section>
  );
}

function VoiceSection({ section }) {
  return (
    <section
      data-testid={`from-anna-section-${section.id}`}
      className="max-w-[640px] mx-auto px-6 sm:px-8"
    >
      <p
        className="text-[11px] tracking-[0.42em] uppercase mb-4"
        style={{ color: INK_FAINT }}
      >
        — {section.label}
        {section.durationLabel ? `  ·  ${section.durationLabel}` : ""}
      </p>
      <audio
        controls
        preload="none"
        src={section.src}
        data-testid={`from-anna-section-${section.id}-audio`}
        className="w-full"
      >
        Your browser does not play audio inline. The recording lives at {section.src}.
      </audio>
      <Divider />
    </section>
  );
}

function BookSection({ section }) {
  return (
    <section
      data-testid={`from-anna-section-${section.id}`}
      aria-labelledby={`from-anna-${section.id}-title`}
      className="max-w-[640px] mx-auto px-6 sm:px-8"
    >
      {section.kicker && (
        <p
          data-testid={`from-anna-section-${section.id}-kicker`}
          className="text-[11px] tracking-[0.42em] uppercase mb-5"
          style={{ color: INK_FAINT }}
        >
          — {section.kicker}
        </p>
      )}
      <h2
        id={`from-anna-${section.id}-title`}
        data-testid={`from-anna-section-${section.id}-title`}
        className="text-[26px] sm:text-[30px] leading-[1.18] font-light italic mb-2"
        style={{ fontFamily: SERIF, color: INK }}
      >
        {section.title}
      </h2>
      <p
        data-testid={`from-anna-section-${section.id}-author`}
        className="text-[13px] tracking-[0.16em] uppercase mb-6"
        style={{ color: INK_MUTED }}
      >
        {section.author}
      </p>
      <p
        data-testid={`from-anna-section-${section.id}-body`}
        className="text-[16.5px] sm:text-[17px] leading-[1.85] font-light"
        style={{ fontFamily: SERIF, color: INK_SOFT }}
      >
        {section.body}
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function FromAnna() {
  // §PRESENCE-AUTHENTICITY — this page must not be indexed by search
  // engines. We temporarily override the site-wide robots meta on
  // mount and restore it on unmount.
  useEffect(() => {
    const tag = document.querySelector('meta[name="robots"]');
    const previous = tag ? tag.getAttribute("content") : null;
    if (tag) tag.setAttribute("content", "noindex, nofollow");
    const previousTitle = document.title;
    document.title = "A letter from upstairs · Aurin";
    return () => {
      if (tag && previous !== null) tag.setAttribute("content", previous);
      document.title = previousTitle;
    };
  }, []);

  const visibleSections = FROM_ANNA_SECTIONS.filter(sectionHasContent);
  const lastIndex = visibleSections.length - 1;

  return (
    <main
      data-testid="from-anna-page"
      className="min-h-screen w-full antialiased"
      style={{
        ...PAPER_TEXTURE,
        color: INK_SOFT,
        fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Page header ── */}
      <header
        data-testid="from-anna-header"
        className="pt-28 sm:pt-36 pb-12 text-center"
      >
        <p
          data-testid="from-anna-eyebrow"
          aria-hidden="true"
          className="text-[10px] tracking-[0.5em] uppercase"
          style={{ color: INK_FAINT, opacity: 0.55 }}
        >
          —
        </p>
        <h1
          data-testid="from-anna-title"
          className="mt-6 text-[36px] sm:text-[46px] lg:text-[54px] leading-[1.1] font-light italic max-w-[760px] mx-auto px-6"
          style={{ fontFamily: HAND, color: INK }}
        >
          {FROM_ANNA_META.pageTitle}
        </h1>
        {FROM_ANNA_META.pageSubtitle && (
          <p
            data-testid="from-anna-subtitle"
            className="mt-5 text-[15px] sm:text-[16px] italic max-w-[460px] mx-auto px-6"
            style={{ fontFamily: SERIF, color: INK_MUTED }}
          >
            {FROM_ANNA_META.pageSubtitle}
          </p>
        )}
      </header>

      {/* ── Sections (only those with content) ── */}
      <div className="pb-20">
        {visibleSections.map((section, i) => {
          const isLast = i === lastIndex;
          if (section.kind === "text") {
            return (
              <TextSection
                key={section.id}
                section={section}
                index={isLast ? "last" : i}
              />
            );
          }
          if (section.kind === "image") {
            return <ImageSection key={section.id} section={section} />;
          }
          if (section.kind === "voice") {
            return <VoiceSection key={section.id} section={section} />;
          }
          if (section.kind === "book") {
            return <BookSection key={section.id} section={section} />;
          }
          return null;
        })}
      </div>

      {/* ── Signature + quiet way back ── */}
      <footer
        data-testid="from-anna-footer"
        className="pb-24 text-center"
      >
        <p
          data-testid="from-anna-signature"
          className="text-[28px] italic"
          style={{ fontFamily: HAND, color: INK }}
        >
          {FROM_ANNA_META.signature}
        </p>
        <div className="mt-12">
          <Link
            to="/"
            data-testid="from-anna-home-link"
            aria-label="Walk back down to the rooms"
            className="text-[11px] tracking-[0.42em] uppercase transition-opacity duration-500"
            style={{ color: INK_MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ← Back down to the house
          </Link>
        </div>
      </footer>
    </main>
  );
}
