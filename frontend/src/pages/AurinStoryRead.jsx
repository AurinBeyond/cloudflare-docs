import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Headphones, FileText, Heart } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
  STORIES,
  getStoryBySlug,
  getGroupBySlug,
} from "@/data/aurinStories";

/**
 * AurinStoryRead — single story view.
 *
 * §AURIN 2026-05-22 — Lightweight by founder directive:
 *   - One illustration at the top
 *   - A short, calm body (read at your own pace)
 *   - Optional HTML5 audio (when /assets/audio/stories/<slug>.mp3 exists)
 *   - Optional PDF download
 *   - Next-story prompt at the bottom (within the same age group)
 *
 * No autoplay. No background music. No tracking. Just a page.
 */
export default function AurinStoryRead() {
  const { storySlug } = useParams();
  const story = getStoryBySlug(storySlug);

  if (!story) {
    return <Navigate to="/aurins-room/stories" replace />;
  }

  const group = getGroupBySlug(story.ageGroup);
  const cover = story.cover || "/assets/aurin/aurin-companion.png";

  // Find the next story in the same age group (gentle prompt at end).
  const sameGroup = STORIES.filter((s) => s.ageGroup === story.ageGroup);
  const idx = sameGroup.findIndex((s) => s.slug === story.slug);
  const nextStory = sameGroup[(idx + 1) % sameGroup.length];

  return (
    <div
      className="min-h-screen bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text))]"
      data-testid="page-aurin-story-read"
    >
      <PageHeader
        eyebrow={`Aurin's Story World · ${group?.label || ""}`}
        title={story.title}
        subtitle={story.intro}
      />

      <div className="mx-auto max-w-3xl px-6 pt-2">
        <Link
          to="/aurins-room/stories"
          data-testid="back-to-story-world"
          className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text))/0.65] hover:text-[hsl(var(--aurin-amber))] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Story World
        </Link>
      </div>

      <article className="mx-auto max-w-3xl px-6 pb-24 pt-6 space-y-8">
        {/* Cover illustration */}
        <div
          className="rounded-2xl overflow-hidden border border-[hsl(var(--aurin-border-soft))]"
          data-testid="story-cover"
        >
          <img
            src={cover}
            alt={story.title}
            className="w-full h-auto block"
            loading="eager"
          />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[hsl(var(--aurin-text))/0.6]">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: group?.accent || "#bcb4a3" }}
          />
          <span>{group?.age}</span>
          <span className="text-[hsl(var(--aurin-text))/0.3]">·</span>
          <span>{story.minutes} min · read together</span>
        </div>

        {/* Audio + PDF row */}
        <div
          className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.45] p-5 md:p-6 space-y-4"
          data-testid="story-media-row"
        >
          {/* Audio */}
          {story.audio ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text))/0.85]">
                <Headphones size={14} className="text-[hsl(var(--aurin-amber))]" />
                <span>Listen — gentle narration</span>
              </div>
              <audio
                controls
                preload="none"
                src={story.audio}
                data-testid="story-audio-player"
                className="w-full"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 text-[13px] text-[hsl(var(--aurin-text))/0.55]"
              data-testid="story-audio-soon"
            >
              <Headphones size={14} />
              <span>Audio version is being quietly recorded. Coming soon.</span>
            </div>
          )}

          {/* PDF */}
          {story.pdf && (
            <a
              href={story.pdf}
              download
              data-testid="story-pdf-download"
              className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-amber))] hover:underline"
            >
              <FileText size={14} /> Download printable PDF
            </a>
          )}
        </div>

        {/* Story body */}
        <div
          className="space-y-5 text-[17px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94] serif-body"
          data-testid="story-body"
        >
          {story.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Soft closing line */}
        <div
          className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] p-6 md:p-7 flex items-start gap-4"
          data-testid="story-closing"
        >
          <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-amber))] shrink-0">
            <Heart size={16} strokeWidth={1.5} />
          </div>
          <div className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78]">
            The end. You can close the page here, or whisper goodnight, or
            simply sit quietly together. The story will be waiting whenever
            you want to come back.
          </div>
        </div>

        {/* Next story prompt */}
        {nextStory && nextStory.slug !== story.slug && (
          <Link
            to={`/aurins-room/stories/${nextStory.slug}`}
            data-testid="story-next-link"
            className="block rounded-2xl border border-[hsl(var(--aurin-border-soft))] p-5 md:p-6 hover:border-[hsl(var(--aurin-amber))/0.6] transition-colors group"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.5] mb-1">
              Another quiet story
            </p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="aurin-serif text-lg">{nextStory.title}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-[hsl(var(--aurin-amber))/0.9] transition group-hover:gap-2">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}
      </article>
    </div>
  );
}
