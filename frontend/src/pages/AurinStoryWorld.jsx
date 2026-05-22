import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Headphones, BookOpen, FileText } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
  STORY_AGE_GROUPS,
  getStoriesByGroup,
} from "@/data/aurinStories";

/**
 * Aurin Story World — quiet bedtime stories for children, organised by age.
 *
 * §AURIN 2026-05-22 — Founder-approved lightweight architecture.
 * No realtime AI, no streaming infra, no autoplay. Each story is a
 * static page with optional pre-recorded MP3 and optional PDF.
 *
 * This grid groups stories by the same age taxonomy used in Aurin's
 * Room (little-dreamers, explorers, dreamweavers). New stories are
 * added by appending to `/app/frontend/src/data/aurinStories.js` —
 * no code changes required here.
 */
export default function AurinStoryWorld() {
  return (
    <div
      className="min-h-screen bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text))]"
      data-testid="page-aurin-story-world"
    >
      <PageHeader
        eyebrow="Aurin's Story World"
        title="Stories from Aurin — your gentle storytelling angel"
        subtitle="Short, calm bedtime stories told by Aurin. Read together, listen quietly, or simply pause for a moment. New stories are added slowly, one at a time."
      />

      {/* Back to Aurin's Room */}
      <div className="mx-auto max-w-5xl px-6 pt-2">
        <Link
          to="/aurins-room"
          data-testid="back-to-aurins-room"
          className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text))/0.65] hover:text-[hsl(var(--aurin-amber))] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Aurin's Room
        </Link>
      </div>

      {/* §AURIN 2026-02-08 — Founder directive: position Aurin as the
          "storytelling angel" character at the top of the shelf. Uses
          object-position:left so the right-side branding text from the
          marketing asset is cropped out. */}
      <section className="mx-auto max-w-5xl px-6 pt-8">
        <div
          data-testid="aurin-angel-intro"
          className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] overflow-hidden backdrop-blur grid grid-cols-1 md:grid-cols-12 items-stretch"
        >
          <div className="md:col-span-5 aspect-[4/3] md:aspect-auto overflow-hidden bg-[hsl(var(--aurin-bg))]">
            <img
              src="/assets/aurin/aurin-companion.png"
              alt="Aurin — a gentle storytelling angel"
              loading="eager"
              style={{ objectPosition: "left center" }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-amber))/0.9] mb-2">
              Meet your storyteller
            </p>
            <h2 className="aurin-serif text-2xl md:text-3xl text-[hsl(var(--aurin-text))] leading-snug">
              Aurin — the storytelling angel
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78]">
              Aurin is not a teacher and not a robot. Aurin is a gentle,
              imaginary friend — an angel of stories who whispers calm tales
              for children of every age. The little ones, the curious ones,
              the dreamers.
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78]">
              Each story below is told in Aurin's quiet voice. Some you can
              read together. Others you can listen to before sleep. There is
              no rush, no ads, no noise — just a small, safe shelf for
              imagination to rest.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-12 space-y-14">
        {STORY_AGE_GROUPS.map((group) => {
          const stories = getStoriesByGroup(group.slug);
          return (
            <div key={group.slug} data-testid={`story-group-${group.slug}`}>
              <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.22em] mb-1"
                    style={{ color: group.accent }}
                  >
                    {group.age}
                  </p>
                  <h2 className="aurin-serif text-2xl md:text-3xl text-[hsl(var(--aurin-text))]">
                    {group.label}
                  </h2>
                  <p className="text-[14px] text-[hsl(var(--aurin-text))/0.65] mt-1 max-w-[60ch]">
                    {group.description}
                  </p>
                </div>
                <span className="text-[12px] text-[hsl(var(--aurin-text))/0.5]">
                  {stories.length}{" "}
                  {stories.length === 1 ? "story" : "stories"}
                </span>
              </div>

              {stories.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed border-[hsl(var(--aurin-border-soft))] p-8 text-center text-[14px] text-[hsl(var(--aurin-text))/0.55]"
                  data-testid={`story-group-empty-${group.slug}`}
                >
                  More stories are quietly being written. Come back soon.
                </div>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <li key={story.slug}>
                      <StoryCard story={story} accent={group.accent} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <p
          data-testid="story-world-footnote"
          className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text))/0.5] pt-6 border-t border-[hsl(var(--aurin-border-soft))]"
        >
          Every story Aurin tells is written to be calm, kind, and free of
          fear. They are meant to be shared between a child and a trusted
          grown-up — read together, listened to before sleep, or simply
          opened on a quiet afternoon.
        </p>
      </section>
    </div>
  );
}

function StoryCard({ story, accent }) {
  const cover = story.cover || "/assets/aurin/aurin-companion.png";
  return (
    <Link
      to={`/aurins-room/stories/${story.slug}`}
      data-testid={`story-card-${story.slug}`}
      className="group block h-full rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] overflow-hidden backdrop-blur transition hover:border-[hsl(var(--aurin-amber))/0.6] hover:bg-[hsl(var(--aurin-bg-elev))/0.75]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--aurin-bg))]">
        <img
          src={cover}
          alt={story.title}
          loading="lazy"
          style={{ objectPosition: "left center" }}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: accent }}
          />
          <span className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text))/0.55]">
            {story.minutes} min · read together
          </span>
        </div>
        <h3 className="aurin-serif text-lg text-[hsl(var(--aurin-text))] leading-snug">
          {story.title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.7]">
          {story.intro}
        </p>

        <div className="mt-4 flex items-center flex-wrap gap-2 text-[11.5px]">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text))/0.7]"
            data-testid={`story-badge-read-${story.slug}`}
          >
            <BookOpen size={11} /> Read
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
              story.audio
                ? "border-[hsl(var(--aurin-amber))/0.4] text-[hsl(var(--aurin-amber))]"
                : "border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text))/0.5]"
            }`}
            data-testid={`story-badge-audio-${story.slug}`}
          >
            <Headphones size={11} /> {story.audio ? "Listen" : "Audio soon"}
          </span>
          {story.pdf && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text))/0.7]"
              data-testid={`story-badge-pdf-${story.slug}`}
            >
              <FileText size={11} /> PDF
            </span>
          )}
        </div>

        <div className="mt-5 inline-flex items-center gap-1 text-sm text-[hsl(var(--aurin-amber))/0.9] transition group-hover:gap-2">
          Open story <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
