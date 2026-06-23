import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * The Aurin Philosophy — the platform's "intellectual north star".
 * Sits between The Origin (personal story) and The Beginning (practice).
 *
 * The voice stays close to the brand — calm, precise, slightly
 * provocative, never coachy. We write "matrix" / "aurin" lowercase and
 * keep the language plain so the ideas can carry their own weight.
 */
export default function AurinPhilosophy() {
  return (
    <div data-testid="page-aurin-philosophy">
      <PageHeader
        tone="default"
        eyebrow="The Aurin Philosophy"
        title="Beyond the frequency of"
        italicWord="limitation."
        description="A short read on the difference between the code you inherited and the code you choose."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px] space-y-12">
          <Block eyebrow="The matrix" data-testid="ap-matrix">
            <p>
              We are born into a world of pre-written code.
            </p>
            <p>
              Not a movie. Not a metaphor. A quiet web of inherited fears,
              scarcity reflexes, and unspoken expectations that runs underneath
              the day like background software.
            </p>
            <p>
              For most people, it defines what feels possible — without ever
              being noticed.
            </p>
          </Block>

          {/* Matrix ↔ Aurin visual divider — founder-supplied illustration */}
          <figure
            data-testid="ap-split-image"
            className="aurin-card overflow-hidden my-2"
          >
            <img
              src="/assets/illustrations/matrix-aurin-split.jpg"
              alt="The Matrix and the Aurin — two figures, two frequencies"
              className="w-full h-auto block"
              loading="lazy"
            />
          </figure>

          <Block eyebrow="The aurin" data-testid="ap-aurin">
            <p>
              Aurin is the part of you that was already there before any of it
              was installed.
            </p>
            <p>
              Not perfection. Not a higher self. Just the original signal —
              clear, calm, and entirely yours.
            </p>
            <p>
              To live by the aurin frequency is to keep noticing the difference
              between what was given to you and what you actually choose.
            </p>
          </Block>

          <div className="aurin-hairline" />

          <div data-testid="ap-pillars" className="space-y-8">
            <div className="aurin-eyebrow">The three pillars</div>
            <Pillar
              n="01"
              title="The mirror principle"
              body="Your outer life is a quiet reflection of your inner code. If something keeps appearing on the outside, the answer is on the inside."
            />
            <Pillar
              n="02"
              title="The sponge effect"
              body="The core programs are usually written before the age of seven. To change a culture, we have to change what a child absorbs in a single ordinary morning."
            />
            <Pillar
              n="03"
              title="Experience over information"
              body="Knowing more is not the same as moving differently. A real shift happens through experience, not through reading."
            />
          </div>

          <div className="aurin-hairline" />

          <div className="aurin-hairline" />

          {/* Inner Architect manifest — the brand's quiet north star */}
          <div data-testid="ap-inner-architect" className="space-y-6">
            <div className="aurin-eyebrow">The Inner Architect — From Masks to Light</div>
            <div className="text-[16.5px] leading-[1.95] text-[hsl(var(--aurin-text))/0.94] space-y-5">
              <p>
                Our programs are invisible, yet they dictate our steps. We wear
                masks — sometimes layers of them — that keep us bound to
                illusions.
              </p>
              <p>
                But there is another way. Within you lives a quieter
                <em> Inner Architect</em> — an honest, original part of
                you that was there before the masks arrived. When you
                listen to that part, life begins to move differently.
                Lighter. Calmer.
              </p>
              <p>
                This is not a religion, not a doctrine, not a path you
                must follow. It is a return — to your own clear voice,
                your own honest steps, your own unpressured pace. You
                may call it whatever feels true to you. The work stays
                the same:{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  hearing yourself a little more clearly each day.
                </span>
              </p>
            </div>
          </div>

          <div className="aurin-hairline" />

          {/* Privacy as luxury — quiet differentiator */}
          <div
            data-testid="ap-privacy-as-luxury"
            className="aurin-card p-6 md:p-7 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Sparkles size={14} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <div className="aurin-eyebrow !mb-0">Privacy as luxury</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                No social-media pixels. No tracking cookies. No public feed.
                Your journey through this work stays yours — that is part of
                the design, not an afterthought.
              </p>
            </div>
          </div>

          {/* Prulesoul insight */}
          <blockquote
            data-testid="ap-prulesoul-insight"
            className="aurin-card p-8 md:p-10 relative overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--aurin-sage) / 0.4), transparent 65%)",
              }}
            />
            <div className="relative">
              <div className="aurin-eyebrow !mb-3">The Prulesoul Insight</div>
              <p className="aurin-serif-italic text-2xl md:text-3xl leading-snug text-[hsl(var(--aurin-text))/0.96]">
                "I am no longer the woman in rose-coloured glasses.
                <br />I am the architect of my own radiance."
              </p>
            </div>
          </blockquote>

          {/* CTA bridge to The Beginning */}
          <div
            data-testid="ap-cta"
            className="aurin-card p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Sparkles size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A quiet next step</div>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                If you're ready to stop being the sponge and start being the
                light, a calm 7-step experience is waiting.
              </p>
            </div>
            <Link
              to="/the-beginning"
              data-testid="ap-cta-begin"
              className="aurin-btn aurin-btn-primary shrink-0"
            >
              Open The Beginning <ArrowRight size={14} />
            </Link>
          </div>

          <div className="text-center pt-4">
            <Link
              to="/about"
              className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
              data-testid="ap-back-origin"
            >
              ← Read The Origin
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

function Pillar({ n, title, body }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-2 md:col-span-1">
        <span className="aurin-display text-[hsl(var(--aurin-sage))] text-2xl">{n}</span>
      </div>
      <div className="col-span-10 md:col-span-11 space-y-2">
        <h3 className="aurin-display text-xl md:text-2xl leading-tight">{title}</h3>
        <p className="text-[15px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[60ch]">
          {body}
        </p>
      </div>
    </div>
  );
}
