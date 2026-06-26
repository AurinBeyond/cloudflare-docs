import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Pause, Heart, Leaf, Sparkles } from "lucide-react";

/**
 * About Anna — Founder of Pure Soul Life / Matrix Aurin.
 *
 * §2026-05-22 — Rewritten by the founder (Anna) herself for launch.
 * Replaces the previous mystical narrative with a warm, grounded,
 * trust-building voice. Uses real founder photos and the
 * storybook-intro video to build trust before LemonSqueezy approval
 * and the Madgicx ad rollout.
 *
 * Assets:
 *   /assets/about/anna-original.jpg          (raw, real portrait)
 *   /assets/about/anna-portrait.jpg          (softer portrait)
 *   /assets/about/anna-storybook-intro.mp4   (intro hero video)
 *   /assets/about/anna-trailer-60s.mp4       (60s trailer, optional play)
 */
export default function About() {
  const videoRef = useRef(null);
  const [trailerPlaying, setTrailerPlaying] = useState(false);

  const toggleTrailer = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setTrailerPlaying(true);
    } else {
      v.pause();
      setTrailerPlaying(false);
    }
  };

  return (
    <div data-testid="page-about-anna">
      {/* ──────────────── HERO ──────────────── */}
      <section
        data-testid="about-hero"
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, hsl(var(--aurin-sage) / 0.16), transparent 55%)",
        }}
      >
        <div className="aurin-container py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left — headline */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="aurin-eyebrow mb-5" data-testid="about-eyebrow">
              About Anna · Founder
            </div>
            <h1
              data-testid="about-headline"
              className="aurin-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
            >
              I did not want to build another platform competing for attention.{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                I wanted to build a calmer place.
              </span>
            </h1>
            <p
              data-testid="about-compass-line"
              className="mt-5 text-[15px] md:text-[16.5px] leading-[1.65] text-[hsl(var(--aurin-brass))] italic max-w-[52ch]"
            >
              A quiet room for noticing what is already shaping your life.
            </p>
            <p
              data-testid="about-subheadline"
              className="mt-5 text-[16.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[55ch]"
            >
              My name is Anna. This project was born from something deeply
              personal — and from one quiet belief: that technology should
              support a calmer daily life, not consume it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/the-beginning"
                data-testid="about-cta-begin"
                className="aurin-btn aurin-btn-primary"
              >
                Step inside <ArrowRight size={14} />
              </Link>
              <Link
                to="/house-preview"
                data-testid="about-cta-rooms"
                className="aurin-btn aurin-btn-ghost"
              >
                See the five rooms
              </Link>
            </div>
          </div>

          {/* Right — real portrait */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div
              className="aurin-card overflow-hidden relative"
              data-testid="about-hero-image-wrap"
            >
              <img
                src="/assets/about/anna-original.jpg"
                alt="Anna — founder of Pure Soul Life and Matrix Aurin"
                data-testid="about-hero-image"
                className="w-full h-auto block"
                loading="eager"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, hsl(var(--aurin-bg) / 0.55) 100%)",
                }}
              />
              <div className="absolute bottom-4 left-5 right-5 text-[12.5px] text-[hsl(var(--aurin-text))/0.92] flex items-center gap-2">
                <Leaf size={13} className="text-[hsl(var(--aurin-sage))]" />
                <span className="aurin-serif-italic">
                  Founder · Pure Soul Life / Matrix Aurin
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── PERSONAL NARRATIVE ──────────────── */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container max-w-[760px] space-y-12">
          <Block eyebrow="Where this began" testid="about-block-1">
            <p>
              For many years, I watched how people slowly became
              disconnected — from themselves, from calmness, from meaningful
              conversations, from imagination, and sometimes even from hope.
            </p>
            <p>
              Modern life became louder, faster, more stressful, and more
              emotionally distant. People are surrounded by information, yet
              many still feel unseen and alone.
            </p>
            <p>
              I did not want to create another <em>"platform competing for attention,"</em> another
              cold technology product, or another place that treats human
              emotions like data.
            </p>
            <p className="text-[hsl(var(--aurin-text))/0.96]">
              I wanted to create something that feels different.
            </p>
          </Block>

          {/* Soft promise band */}
          <div
            data-testid="about-promise-band"
            className="aurin-card p-8 md:p-10 relative overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--aurin-sage) / 0.45), transparent 65%)",
              }}
            />
            <div className="relative space-y-3">
              <div className="aurin-eyebrow !mb-2">What this place is</div>
              <p className="aurin-serif-italic text-[19px] md:text-[21px] leading-snug text-[hsl(var(--aurin-text))/0.96]">
                A calm digital space.<br />
                A place where people can pause.<br />
                A place where conversation feels gentle instead of overwhelming.<br />
                A place where technology stays in the background, and human
                presence comes first.
              </p>
              <p className="text-[14.5px] text-[hsl(var(--aurin-text-muted))] pt-3">
                That is how Pure Soul Life and Matrix Aurin began.
              </p>
            </div>
          </div>

          <Block eyebrow="The rooms" testid="about-block-2">
            <p>
              The rooms inside this world were created for different emotional
              needs. Some people need clarity. Some need grounding. Some
              simply need a quiet space where they can think without pressure.
              Others want reflection, structure, or support during difficult
              moments in life.
            </p>
            <p>
              The purpose is not to replace human relationships, therapy, or
              real life. The purpose is to offer a calmer digital experience
              in a world that often feels emotionally exhausting.
            </p>
          </Block>

          {/* ──────────────── TRAILER ──────────────── */}
          <div
            data-testid="about-trailer"
            className="aurin-card overflow-hidden relative"
          >
            <video
              ref={videoRef}
              src="/assets/about/anna-trailer-60s.mp4"
              poster="/assets/about/anna-portrait.jpg"
              data-testid="about-trailer-video"
              className="w-full h-auto block"
              playsInline
              preload="metadata"
              onEnded={() => setTrailerPlaying(false)}
            />
            {!trailerPlaying && (
              <button
                type="button"
                onClick={toggleTrailer}
                data-testid="about-trailer-play"
                className="absolute inset-0 flex items-center justify-center group"
                aria-label="Play 60-second introduction"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--aurin-bg) / 0.15), hsl(var(--aurin-bg) / 0.55))",
                }}
              >
                <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--aurin-bg))/0.7] backdrop-blur-md border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] group-hover:scale-105 transition-transform">
                  <Play size={26} strokeWidth={1.5} className="ml-1" />
                </span>
              </button>
            )}
            {trailerPlaying && (
              <button
                type="button"
                onClick={toggleTrailer}
                data-testid="about-trailer-pause"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[hsl(var(--aurin-bg))/0.7] backdrop-blur-md border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text))]"
                aria-label="Pause"
              >
                <Pause size={16} strokeWidth={1.5} />
              </button>
            )}
            <div className="px-6 py-4 border-t border-[hsl(var(--aurin-border-soft))] text-[13px] text-[hsl(var(--aurin-text-muted))] flex items-center gap-2">
              <Sparkles size={13} className="text-[hsl(var(--aurin-sage))]" />
              <span>A quiet 60-second introduction · from Anna, in her own voice.</span>
            </div>
          </div>

          {/* ──────────────── CHILDREN'S UNIVERSE ──────────────── */}
          <Block eyebrow="The children's universe" testid="about-block-3">
            <p>
              The children's universe was especially important to me.
            </p>
            <p>
              Today many children grow up surrounded by endless stimulation,
              short attention spans, pressure, fear, and digital noise. I
              wanted to create a softer space that protects imagination
              instead of destroying it — a place that encourages curiosity,
              creativity, emotional safety, and wonder.
            </p>
            <p className="text-[hsl(var(--aurin-text))/0.96]">
              That is why Aurin exists.
            </p>
            <p>
              Aurin is not a "robot." Not a teacher. Not a replacement for
              parents. Aurin represents imagination, gentle storytelling, and
              a safe fantasy presence that children can experience together
              with their parents in a calm and thoughtful way.
            </p>
          </Block>

          {/* Aurin storybook intro video — autoplay muted loop, decorative */}
          <div
            data-testid="about-storybook-strip"
            className="aurin-card overflow-hidden"
          >
            <video
              src="/assets/about/anna-storybook-intro.mp4"
              data-testid="about-storybook-video"
              className="w-full h-auto block"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="px-6 py-4 border-t border-[hsl(var(--aurin-border-soft))] text-[13px] text-[hsl(var(--aurin-text-muted))] flex items-center gap-2">
              <Heart size={13} className="text-[hsl(var(--aurin-sage))]" />
              <span>A glimpse of Aurin's Story World — for children and the parents who read with them.</span>
            </div>
          </div>

          {/* ──────────────── THE CORE IDEA ──────────────── */}
          <div
            data-testid="about-core-idea"
            className="aurin-card p-8 md:p-10 relative overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 w-[280px] h-[280px] rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--aurin-sage) / 0.35), transparent 65%)",
              }}
            />
            <div className="relative">
              <div className="aurin-eyebrow !mb-3">The core idea</div>
              <p className="aurin-serif-italic text-xl md:text-2xl leading-snug text-[hsl(var(--aurin-text))/0.96]">
                "Technology should support a calmer daily life — not consume it."
              </p>
              <p className="mt-6 text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94]">
                I believe people do not only search for answers. They search
                for understanding. For clarity. For emotional safety. For a
                feeling that someone — or something — is listening without
                judgment.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94]">
                That is the heart behind this work.
              </p>
            </div>
          </div>

          {/* ──────────────── A SMALL STORY (Carrot) ────────────────
              §FOUNDER 2026-02-09 — Personal story shared by Anna.
              Frames her parenting philosophy as a single warm memory
              rather than a rulebook. Gilded-frame + handwriting feel
              so it reads like a page from her own journal pinned to
              the wall. Lightly polished from her original wording. */}
          <div
            data-testid="about-carrot-story"
            className="relative mx-auto max-w-[680px] my-4"
          >
            <div
              className="relative p-6 md:p-10"
              style={{
                background: "linear-gradient(135deg, #f7f1e3 0%, #f4ead0 50%, #ede0b8 100%)",
                border: "12px solid",
                borderImage:
                  "linear-gradient(135deg, #c8a96a 0%, #e8d28a 40%, #b8924a 80%, #d4b06a 100%) 1",
                boxShadow:
                  "0 0 0 1px rgba(184,146,74,0.4), 0 20px 50px rgba(0,0,0,0.45), inset 0 0 60px rgba(184,146,74,0.08)",
                borderRadius: "4px",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(0,0,0,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.3) 0%, transparent 50%)",
                }}
              />
              <div className="relative">
                <p
                  className="text-center text-[10px] tracking-[0.35em] uppercase mb-5"
                  style={{ color: "#8a6a2c", fontFamily: "serif" }}
                >
                  — A small story —
                </p>
                <h3
                  data-testid="about-carrot-title"
                  className="text-center text-[26px] md:text-[32px] leading-tight mb-6"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    color: "#3d2a14",
                    fontWeight: 600,
                  }}
                >
                  The carrots
                </h3>
                <div
                  data-testid="about-carrot-body"
                  className="space-y-4 text-[17px] md:text-[19px] leading-[1.8]"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    color: "#3d2a14",
                  }}
                >
                  <p>
                    We lived in the countryside then. My daughter was three.
                    It was June — the very first young vegetables were
                    appearing in the garden, but the main rows were planted
                    for winter storage.
                  </p>
                  <p>
                    One sunny afternoon I was sitting indoors with my mother
                    and my sister&apos;s children, when we heard a frightening
                    clatter at the door. The door opened — and first a huge
                    green washtub rolled in, and behind it appeared my tiny
                    three-year-old daughter.
                  </p>
                  <p>
                    We had a hundred square metres of carrots planted. The
                    roots had barely begun to form. She had wanted to make us
                    a surprise — she had pulled out every single carrot.
                  </p>
                  <p>
                    I felt my chest go cold. My first instinct was to shout.
                    But I held it inside, because I understood — she had
                    wanted to do something good. She had worked so hard to
                    pull them out of the ground and carry them in that green
                    tub, all the way home, to show us.
                  </p>
                  <p>
                    I lifted her into my lap. I told her: <em>that you
                    wanted to help is a beautiful thing — but pulling the
                    carrots up so early is a lesson for next time. Before
                    we harvest, the carrots must be allowed to grow up.</em>
                  </p>
                  <p>
                    If I had shouted at her that day, she would never have
                    tried to help me again.
                  </p>
                  <p
                    className="text-center pt-3"
                    style={{ color: "#6b4f24", fontStyle: "italic" }}
                  >
                    To this day we remember those carrots and laugh. She
                    says they felt huge to her at the time — she even fell
                    on her bottom once, because a carrot wouldn&apos;t come
                    out.
                  </p>
                </div>
                <p
                  className="text-right mt-6 text-[15px]"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    color: "#6b4f24",
                  }}
                >
                  — Anna
                </p>
              </div>
            </div>
            {/* Tiny hint below the frame */}
            <p className="text-center text-[11px] text-[hsl(var(--aurin-text-muted))] mt-3 italic">
              A memory pinned to the wall of why this work exists.
            </p>
          </div>
          <div
            data-testid="about-signature"
            className="flex flex-col md:flex-row gap-6 items-start md:items-center pt-4"
          >
            <div className="shrink-0">
              <img
                src="/assets/about/anna-portrait.jpg"
                alt="Anna"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-[hsl(var(--aurin-border))]"
                data-testid="about-signature-avatar"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <p className="text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94]">
                Thank you for being here.
              </p>
              <p className="aurin-serif-italic text-lg mt-2 text-[hsl(var(--aurin-text))]">
                — Anna
              </p>
              <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] mt-1">
                Founder of Pure Soul Life / Matrix Aurin
              </p>
            </div>
          </div>

          {/* ──────────────── QUIET NEXT STEP ──────────────── */}
          <div
            data-testid="about-final-cta"
            className="aurin-card p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Sparkles size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A quiet next step</div>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                If something in this resonates, the rooms are waiting. No
                pressure, no noise — just a calmer place to begin.
              </p>
            </div>
            <Link
              to="/the-beginning"
              data-testid="about-cta-begin-bottom"
              className="aurin-btn aurin-btn-primary shrink-0"
            >
              Begin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ eyebrow, children, testid }) {
  return (
    <div data-testid={testid}>
      <div className="aurin-eyebrow mb-4">{eyebrow}</div>
      <div className="text-[16.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94] space-y-4">
        {children}
      </div>
    </div>
  );
}
