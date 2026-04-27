import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEntries } from "@/lib/api";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

/**
 * The Origin — Meeting Prulesoul.
 *
 * The most personal page on the platform. Pulls the seeded brand entry
 * from /api/content/entries?surface=brand (slug 'about-the-author') and
 * renders it inside a deliberately personal layout: stone-portal hero,
 * narrative voice, founder's promise, soft Guardian invitation, and a
 * quiet bridge to The Beginning.
 */
export default function About() {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchEntries({ surface: "brand" });
        const preferred =
          list?.find((e) => e.slug === "about-the-author") || list?.[0] || null;
        if (alive) setEntry(preferred);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-about">
      {/* Hero — mirror image + headline */}
      <section
        className="relative overflow-hidden"
        data-testid="origin-hero"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, hsl(var(--aurin-sage) / 0.18), transparent 55%)",
        }}
      >
        <div className="aurin-container py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="aurin-eyebrow mb-5">The Origin · Meeting Prulesoul</div>
            <h1
              data-testid="origin-headline"
              className="aurin-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
            >
              I spent fifty years observing the matrix{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                before I decided to rewrite it.
              </span>
            </h1>
            <p
              data-testid="origin-subheadline"
              className="mt-7 text-[16.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[55ch]"
            >
              A journey from inherited illusions to the raw beauty of aurin
              radiance. This is not a polished biography — it is the quiet
              record of someone who finally stopped wearing the rose-coloured
              glasses.
            </p>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="aurin-card overflow-hidden" data-testid="origin-hero-image-wrap">
              <img
                src="/assets/origin/authentic-mirror.png"
                alt="A woman and her child standing inside an old stone portal at dawn — the authentic mirror"
                data-testid="origin-hero-image"
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Narrative — the prulesoul story */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container max-w-[760px] space-y-12">
          <Block eyebrow="What I saw" data-testid="origin-narrative-1">
            <p>
              For half a century I watched the world through a lens I didn't
              know was tinted.
            </p>
            <p>
              I saw how we — as parents, as partners, as humans — pass down
              <em> scarcity software</em> and <em>quiet fear loops</em> to the
              next generation without even realising it. We tell our children
              to be free while we ourselves live in cages made of old words and
              ancient wounds.
            </p>
          </Block>

          <Block eyebrow="What changed" data-testid="origin-narrative-2">
            <p>
              My awakening wasn't a sudden flash. It was a quiet decision to
              take off the rose-coloured glasses.
            </p>
            <p>
              I realised that life isn't a pink foam of illusions. It is a
              powerful, sometimes raw, and infinitely more beautiful reality
              when you finally own your own frequency.
            </p>
            <p>
              Together with my child, I began the slow work of uprooting the
              programs that were never ours to begin with.
            </p>
          </Block>

          <Block eyebrow="Why this exists" data-testid="origin-narrative-3">
            <p>
              <strong className="text-[hsl(var(--aurin-text))]">prulesoul</strong>{" "}
              is the result of that liberation. I am not here to give you more
              information. I am here to help you reach the same kind of
              transformation.
            </p>
          </Block>

          {/* Read the seeded preface */}
          {entry && entry.html && (
            <details
              data-testid="origin-preface"
              className="aurin-card p-7 md:p-8 group"
            >
              <summary className="cursor-pointer flex items-center justify-between gap-4 list-none">
                <div>
                  <div className="aurin-eyebrow !mb-1">The longer preface</div>
                  <h3 className="aurin-display text-xl">{entry.title}</h3>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[hsl(var(--aurin-sage))] transition-transform group-open:rotate-90"
                />
              </summary>
              <div
                className="aurin-prose serif-body mt-6"
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            </details>
          )}

          {/* Founder's promise */}
          <blockquote
            data-testid="origin-promise"
            className="aurin-card p-8 md:p-10 relative overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -top-20 -left-20 w-[320px] h-[320px] rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--aurin-sage) / 0.4), transparent 65%)",
              }}
            />
            <div className="relative">
              <div className="aurin-eyebrow !mb-3">The Founder's Promise</div>
              <p className="aurin-serif-italic text-xl md:text-2xl leading-snug text-[hsl(var(--aurin-text))/0.96]">
                "I am no longer the woman living in an illusion. I am a witness
                to the power of the aurin frequency. My mission is to ensure
                that no child has to grow up absorbing trash programs — and
                that no adult has to die carrying them."
              </p>
              <p className="mt-6 text-[14px] text-[hsl(var(--aurin-text-muted))]">
                We are the architects. We are the programmers.
              </p>
            </div>
          </blockquote>

          {/* Guardian invitation — soft, not a chatbot */}
          <div
            data-testid="origin-guardian-invite"
            className="aurin-card p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-5"
          >
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Compass size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A small invitation</div>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                Every journey starts with noticing the first <em>glitch</em> in
                the code. What brought you here today?
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {[
                  { label: "I want to heal my lineage", to: "/the-beginning" },
                  { label: "I want to find my purpose", to: "/aurin-philosophy" },
                  { label: "I want to free my mind", to: "/the-beginning" },
                ].map((b) => (
                  <Link
                    key={b.label}
                    to={b.to}
                    data-testid={`origin-guardian-${b.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="aurin-btn aurin-btn-ghost !py-2 !px-3.5 !text-[12px]"
                  >
                    {b.label} <ArrowRight size={11} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div
            data-testid="origin-final-cta"
            className="aurin-card p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Sparkles size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A quiet next step</div>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                A calm 7-day beginning. Free, for now. What you write stays
                yours alone.
              </p>
            </div>
            <Link
              to="/the-beginning"
              data-testid="origin-cta-begin"
              className="aurin-btn aurin-btn-primary shrink-0"
            >
              Explore The Beginning <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ eyebrow, children, ...rest }) {
  return (
    <div {...rest}>
      <div className="aurin-eyebrow mb-4">{eyebrow}</div>
      <div className="text-[16.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94] space-y-4">
        {children}
      </div>
    </div>
  );
}
